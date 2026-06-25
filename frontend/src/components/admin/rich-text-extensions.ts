import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import Youtube from '@tiptap/extension-youtube';
import StarterKit from '@tiptap/starter-kit';

export function richTextExtensions() {
  return [
    StarterKit.configure({ heading: { levels: [2, 3] } }),
    Underline,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: { class: 'text-primary underline', rel: 'noopener noreferrer' },
    }),
    Image.configure({ HTMLAttributes: { class: 'my-4 max-w-full rounded-lg' } }),
    Youtube.configure({
      width: 640,
      height: 360,
      HTMLAttributes: { class: 'my-4 w-full rounded-lg' },
    }),
  ];
}
