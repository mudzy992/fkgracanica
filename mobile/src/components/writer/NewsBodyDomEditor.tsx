'use dom';

import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import Youtube from '@tiptap/extension-youtube';
import { EditorContent, useEditor, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';

type Props = {
  html: string;
  onChangeHtml: (html: string) => Promise<void>;
  onRequestImage: () => Promise<string | null>;
  dom?: import('expo/dom').DOMProps;
};

function tool(editor: Editor, label: string, action: () => void, active?: boolean) {
  return (
    <button
      key={label}
      type="button"
      onClick={action}
      style={{
        height: 28,
        padding: '0 8px',
        fontSize: 12,
        borderRadius: 6,
        border: '1px solid #334155',
        background: active ? '#1E3A8A' : '#0A1525',
        color: '#F8FAFC',
      }}
    >
      {label}
    </button>
  );
}

function cmd(editor: Editor) {
  return editor.chain().focus() as any;
}

function Toolbar({ editor, onRequestImage }: { editor: Editor; onRequestImage: Props['onRequestImage'] }) {
  const setLink = () => {
    const prev = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('URL:', prev ?? 'https://');
    if (url === null) return;
    if (!url) {
      cmd(editor).extendMarkRange('link').unsetLink().run();
      return;
    }
    cmd(editor).extendMarkRange('link').setLink({ href: url }).run();
  };
  const setVideo = () => {
    const url = window.prompt('YouTube URL:', 'https://www.youtube.com/watch?v=');
    if (!url?.trim()) return;
    cmd(editor).setYoutubeVideo({ src: url.trim() }).run();
  };
  const insertImage = async () => {
    const src = await onRequestImage();
    if (src) cmd(editor).setImage({ src }).run();
  };
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, padding: 8, borderBottom: '1px solid #334155' }}>
      {tool(editor, 'B', () => cmd(editor).toggleBold().run(), editor.isActive('bold'))}
      {tool(editor, 'I', () => cmd(editor).toggleItalic().run(), editor.isActive('italic'))}
      {tool(editor, 'U', () => cmd(editor).toggleUnderline().run(), editor.isActive('underline'))}
      {tool(editor, 'H2', () => cmd(editor).toggleHeading({ level: 2 }).run(), editor.isActive('heading', { level: 2 }))}
      {tool(editor, 'H3', () => cmd(editor).toggleHeading({ level: 3 }).run(), editor.isActive('heading', { level: 3 }))}
      {tool(editor, '•', () => cmd(editor).toggleBulletList().run(), editor.isActive('bulletList'))}
      {tool(editor, '1.', () => cmd(editor).toggleOrderedList().run(), editor.isActive('orderedList'))}
      {tool(editor, '❝', () => cmd(editor).toggleBlockquote().run(), editor.isActive('blockquote'))}
      {tool(editor, '—', () => cmd(editor).setHorizontalRule().run())}
      {tool(editor, 'Link', setLink, editor.isActive('link'))}
      {tool(editor, 'Slika', () => void insertImage())}
      {tool(editor, 'Video', setVideo, editor.isActive('youtube'))}
    </div>
  );
}

export default function NewsBodyDomEditor({ html, onChangeHtml, onRequestImage }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer' } }),
      Image,
      Youtube.configure({ width: 640, height: 360 }),
    ] as never,
    content: html || '<p></p>',
    onUpdate: ({ editor: e }: { editor: Editor }) => {
      void onChangeHtml(e.getHTML());
    },
  } as never);

  useEffect(() => {
    if (!editor || editor.getHTML() === html) return;
    editor.commands.setContent(html || '<p></p>', { emitUpdate: false });
  }, [editor, html]);

  if (!editor) return null;

  return (
    <div style={{ background: '#050A14', color: '#F8FAFC', fontFamily: 'system-ui, sans-serif' }}>
      <Toolbar editor={editor} onRequestImage={onRequestImage} />
      <div style={{ padding: 12, minHeight: 220 }}>
        <EditorContent editor={editor} />
      </div>
      <style>{`
        .tiptap { outline: none; min-height: 200px; font-size: 15px; line-height: 1.5; }
        .tiptap img { max-width: 100%; border-radius: 8px; }
        .tiptap iframe { width: 100%; aspect-ratio: 16/9; border-radius: 8px; }
        .tiptap a { color: #93C5FD; }
        .tiptap h2, .tiptap h3 { margin: 12px 0 8px; }
      `}</style>
    </div>
  );
}
