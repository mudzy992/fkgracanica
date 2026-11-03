import type { Editor } from '@tiptap/react';
import { Button } from '../ui/button';

interface Props {
  editor: Editor;
  onInsertImage: () => void;
}

export function RichTextToolbar({ editor, onInsertImage }: Props) {
  const tool = (label: string, action: () => void, active?: boolean) => (
    <Button
      key={label}
      type="button"
      size="sm"
      variant={active ? 'default' : 'outline'}
      className="h-7 px-2 text-xs"
      onClick={action}
    >
      {label}
    </Button>
  );

  const setLink = () => {
    const prev = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('URL linka:', prev ?? 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const setVideo = () => {
    const url = window.prompt('YouTube URL:', 'https://www.youtube.com/watch?v=');
    if (!url?.trim()) return;
    editor.chain().focus().setYoutubeVideo({ src: url.trim() }).run();
  };

  return (
    <div className="flex flex-wrap gap-1 border-b border-slate-200 p-2">
      {tool('B', () => editor.chain().focus().toggleBold().run(), editor.isActive('bold'))}
      {tool('I', () => editor.chain().focus().toggleItalic().run(), editor.isActive('italic'))}
      {tool(
        'U',
        () => editor.chain().focus().toggleUnderline().run(),
        editor.isActive('underline'),
      )}
      {tool(
        'H2',
        () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
        editor.isActive('heading', { level: 2 }),
      )}
      {tool(
        'H3',
        () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
        editor.isActive('heading', { level: 3 }),
      )}
      {tool(
        '•',
        () => editor.chain().focus().toggleBulletList().run(),
        editor.isActive('bulletList'),
      )}
      {tool(
        '1.',
        () => editor.chain().focus().toggleOrderedList().run(),
        editor.isActive('orderedList'),
      )}
      {tool(
        '❝',
        () => editor.chain().focus().toggleBlockquote().run(),
        editor.isActive('blockquote'),
      )}
      {tool('—', () => editor.chain().focus().setHorizontalRule().run())}
      {tool('Link', setLink, editor.isActive('link'))}
      {tool('Slika', onInsertImage)}
      {tool('Video', setVideo, editor.isActive('youtube'))}
    </div>
  );
}
