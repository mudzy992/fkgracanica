import { useEditor, EditorContent } from '@tiptap/react';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { asArray } from '../../lib/as-array';
import { useMediaAssets, type MediaAsset } from '../../hooks/use-media-admin';
import { mediaUrl } from '../../lib/media';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Dialog, DialogBody, DialogHeader } from '../ui/dialog';
import { richTextExtensions } from './rich-text-extensions';
import { RichTextToolbar } from './RichTextToolbar';

interface Props {
  value: string;
  onChange: (html: string) => void;
  className?: string;
  tall?: boolean;
}

export function RichTextEditor({ value, onChange, className, tall }: Props) {
  const { t } = useTranslation();
  const [mediaOpen, setMediaOpen] = useState(false);
  const { data, isLoading } = useMediaAssets({ limit: 100 });
  const assets = asArray<MediaAsset>(data?.data ?? data);

  const editor = useEditor({
    extensions: richTextExtensions(),
    content: value || '<p></p>',
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm max-w-none px-3 py-2 focus:outline-none [&_img]:rounded-lg [&_iframe]:aspect-video [&_iframe]:w-full',
          tall ? 'min-h-[28rem]' : 'min-h-[180px]',
        ),
      },
    },
  });

  useEffect(() => {
    if (!editor || editor.getHTML() === value) return;
    editor.commands.setContent(value || '<p></p>', { emitUpdate: false });
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
