import { Node, nodePasteRule, type Editor } from '@tiptap/react';
import {
  DOMParser as ProseMirrorParser,
  DOMSerializer,
  type Node as ProseMirrorNode,
} from '@tiptap/pm/model';
import type {} from '@tiptap/extension-youtube';
import i18n from '../../i18n';
import { safeEditorYoutubeSrc, safeYoutubePasteMatches } from './secure-youtube-url';
import {
  createView,
  safeFrameAttributes,
  FRAME_ALLOW,
  type FrameAttributes,
  type Options,
} from './secure-youtube-view';
export { safeYoutubePasteMatches, sanitizePastedIframes } from './secure-youtube-url';

function originalAttributes(element: HTMLElement): FrameAttributes {
  return Object.fromEntries(Array.from(element.attributes, ({ name, value }) => [name, value]));
}

export const SecureYoutube = Node.create<Options>({
  name: 'youtube',
  group: 'block',
  draggable: true,
  addOptions() {
    return { width: 640, height: 360, HTMLAttributes: {} };
  },
  addAttributes() {
    return {
      src: { default: null, parseHTML: (element: HTMLElement) => element.getAttribute('src') },
      width: {
        default: this.options.width,
        parseHTML: (element: HTMLElement) => element.getAttribute('width') ?? this.options.width,
      },
      height: {
        default: this.options.height,
        parseHTML: (element: HTMLElement) => element.getAttribute('height') ?? this.options.height,
      },
      originalAttributes: { default: null, rendered: false, parseHTML: originalAttributes },
      originalWrapper: {
        default: null,
        rendered: false,
        parseHTML: (element: HTMLElement) =>
          element.parentElement?.matches('div[data-youtube-video]')
            ? originalAttributes(element.parentElement)
            : null,
      },
    };
  },
  parseHTML() {
    return [{ tag: 'div[data-youtube-video] iframe' }, { tag: 'iframe' }];
  },
  addCommands() {
    return {
      setYoutubeVideo:
        (options) =>
        ({ commands }) => {
          const src = safeEditorYoutubeSrc(options.src);
          if (!src) return false;
          return commands.insertContent({ type: this.name, attrs: { ...options, src } });
        },
    };
  },
  addPasteRules() {
    return [
      nodePasteRule({
        find: safeYoutubePasteMatches,
        type: this.type,
        getAttributes: (match) => ({ src: safeEditorYoutubeSrc(match[0]) }),
      }),
    ];
  },
  addNodeView() {
    return ({ node, editor, getPos }) => createView(node, editor, getPos, this.options);
  },
  renderHTML({ node }) {
    // ProseMirror may use this while tearing down a NodeView: it must always be safe.
    const attributes = safeFrameAttributes(node, this.options);
    if (!attributes) return ['p', { role: 'status' }, i18n.t('video.embeddedUnavailable')];
    return ['div', { 'data-youtube-video': '' }, ['iframe', attributes]];
  },
});

/** Parse existing HTML inside an inert template, rather than DOMParser's resource-loading document. */
export function parseStoredHtml(editor: Editor, html: string): ProseMirrorNode {
  const template = document.createElement('template');
  template.innerHTML = html;
  return ProseMirrorParser.fromSchema(editor.schema).parse(template.content);
}

/** Serialize legacy attrs only inside a template's inert document; never place them in the live DOM. */
export function getStoredHtml(editor: Editor): string {
  const template = document.createElement('template');
  const base = DOMSerializer.fromSchema(editor.schema);
  const options = editor.extensionManager.extensions.find(
    (extension) => extension.name === 'youtube',
  )!.options as Options;
  const serializer = new DOMSerializer(
    {
      ...base.nodes,
      youtube(node) {
        const original = node.attrs.originalAttributes as FrameAttributes | null;
        const attributes = original ?? {
          ...options.HTMLAttributes,
          src: node.attrs.src,
          width: node.attrs.width,
          height: node.attrs.height,
          allow: FRAME_ALLOW,
          allowfullscreen: '',
          frameborder: '0',
        };
        const frame: [string, FrameAttributes] = ['iframe', attributes];
        if (original && !node.attrs.originalWrapper) return frame;
        return ['div', node.attrs.originalWrapper ?? { 'data-youtube-video': '' }, frame];
      },
    },
    base.marks,
  );
  serializer.serializeFragment(
    editor.state.doc.content,
    { document: template.content.ownerDocument },
    template.content,
  );
  return template.innerHTML;
}
