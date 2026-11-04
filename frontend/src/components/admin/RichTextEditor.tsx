import { useEditor, EditorContent } from '@tiptap/react';
import { useTranslation } from 'react-i18next';
import { useEffect, useRef, useState } from 'react';
import { asArray } from '../../lib/as-array';
import { useMediaAssets, type MediaAsset } from '../../hooks/use-media-admin';
import { mediaUrl } from '../../lib/media';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Dialog, DialogBody, DialogHeader } from '../ui/dialog';
import { richTextExtensions } from './rich-text-extensions';
import { RichTextToolbar } from './RichTextToolbar';
import { getStoredHtml, parseStoredHtml, sanitizePastedIframes } from './secure-youtube';

interface Props {
  value: string;
  onChange: (html: string) => void;
  className?: string;
  tall?: boolean;
}

export function RichTextEditor({ value, onChange, className, tall }: Props) {
  const { t } = useTranslation();
  const [mediaOpen, setMediaOpen] = useState(false);
  const [pasteUnavailable, setPasteUnavailable] = useState(false);
  const plainPaste = useRef(false);
  const { data, isLoading } = useMediaAssets({ limit: 100 });
  const assets = asArray<MediaAsset>(data?.data ?? data);

  const editor = useEditor({
    // Suspense može odgoditi commit nakon kreiranja; instancu vežemo za mount.
    immediatelyRender: false,
    extensions: richTextExtensions(),
    content: '<p></p>',
    onUpdate: ({ editor: e }) => onChange(getStoredHtml(e)),
    editorProps: {
      handleDOMEvents: {
        keydown: (_view, event) => {
          if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'v')
            plainPaste.current = event.shiftKey;
          return false;
        },
        keyup: (_view, event) => {
          if (event.key.toLowerCase() === 'v') plainPaste.current = false;
          return false;
        },
        paste: (view, event) => {
          let html = '';
          let text = '';
          try {
            html = event.clipboardData?.getData('text/html') ?? '';
            text =
              event.clipboardData?.getData('text/plain') ||
              event.clipboardData?.getData('Text') ||
              event.clipboardData?.getData('text/uri-list') ||
              '';
          } catch {
            /* An inaccessible clipboard is handled below. */
          }
          const asPlain = plainPaste.current;
          plainPaste.current = false;
          if (!html && !text) {
            // ProseMirror's fallback pastes into a live, off-screen element before sanitizing.
            event.preventDefault();
            setPasteUnavailable(true);
            return true;
          }
          setPasteUnavailable(false);
          if (view.composing || /<iframe[\s/>]/i.test(html)) {
            // Avoid native/fallback insertion even on browsers with a broken Clipboard API.
            event.preventDefault();
            if (asPlain || !html) view.pasteText(text, event);
            else view.pasteHTML(html, event);
            return true;
          }
          return false;
        },
      },
      transformPastedHTML: (html) => sanitizePastedIframes(html, t('video.embeddedUnavailable')),
      attributes: {
        class: cn(
          'prose prose-sm max-w-none px-3 py-2 focus:outline-none [&_img]:rounded-lg [&_iframe]:aspect-video [&_iframe]:w-full',
          tall ? 'min-h-[28rem]' : 'min-h-[180px]',
        ),
      },
    },
  });

  useEffect(() => {
    if (!editor || getStoredHtml(editor) === value) return;
    editor.commands.setContent(parseStoredHtml(editor, value || '<p></p>'), { emitUpdate: false });
  }, [editor, value]);

  const insertImage = (path: string) => {
    const src = path.startsWith('http') ? path : (mediaUrl(path, 'medium') ?? path);
    editor?.chain().focus().setImage({ src }).run();
    setMediaOpen(false);
  };

  if (!editor) return null;

  return (
    <div className={cn('rounded-lg border border-slate-200', className)}>
      <RichTextToolbar editor={editor} onInsertImage={() => setMediaOpen(true)} />
      {pasteUnavailable && (
        <p role="alert" className="px-3 py-1 text-sm text-danger">
          {t('video.pasteUnavailable')}
        </p>
      )}
      <EditorContent editor={editor} />
      <Dialog open={mediaOpen} onOpenChange={setMediaOpen} className="max-w-md">
        <DialogHeader onClose={() => setMediaOpen(false)}>
          {t('admin.mediaPicker.insertImage')}
        </DialogHeader>
        <DialogBody>
          {isLoading && <p className="text-sm text-text-muted">{t('admin.common.loading')}</p>}
          <div className="grid grid-cols-3 gap-2">
            {assets.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => insertImage(a.originalPath)}
                className="overflow-hidden rounded-lg border border-slate-200 hover:border-primary"
              >
                <img
                  src={mediaUrl(a.thumbPath ?? a.originalPath, 'thumb')}
                  alt={a.filename}
                  className="aspect-square w-full object-cover"
                />
              </button>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3 w-full"
            onClick={() => {
              const url = window.prompt('URL slike:', 'https://');
              if (url?.trim()) insertImage(url.trim());
            }}
          >
            URL slike
          </Button>
        </DialogBody>
      </Dialog>
    </div>
  );
}
