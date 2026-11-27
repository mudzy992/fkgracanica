import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import { SecureYoutube } from './secure-youtube';
import { safeEditorYoutubeSrc } from './secure-youtube-url';
import StarterKit from '@tiptap/starter-kit';

export function richTextExtensions() {
  return [
    StarterKit.configure({ heading: { levels: [2, 3] } }),
    Underline,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: { class: 'text-primary underline', rel: 'noopener noreferrer' },
      // YouTube links should become embeds, not hyperlinks
      shouldAutoLink: (url: string) => !safeEditorYoutubeSrc(url),
      isAllowedUri: (url: string, ctx: { defaultValidate: (url: string) => boolean }) => {
        if (safeEditorYoutubeSrc(url)) return false;
        return ctx.defaultValidate(url);
      },
    }),
    Image.configure({ HTMLAttributes: { class: 'my-4 max-w-full rounded-lg' } }),
    SecureYoutube.configure({
      width: 640,
      height: 360,
      HTMLAttributes: { class: 'my-4 w-full rounded-lg' },
    }),
  ];
}
