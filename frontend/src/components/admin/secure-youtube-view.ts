import type { Editor } from '@tiptap/react';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import i18n from '../../i18n';
import { safeRichIframeSrc } from '../../lib/youtube';
import { safeEditorYoutubeSrc } from './secure-youtube-url';

export interface Options {
  width: number;
  height: number;
  HTMLAttributes: Record<string, string>;
}
export type FrameAttributes = Record<string, string>;
export const FRAME_ALLOW =
  'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';

export function safeFrameAttributes(
  node: ProseMirrorNode,
  options: Options,
): FrameAttributes | null {
  const src = typeof node.attrs.src === 'string' ? node.attrs.src : '';
  const safe = safeRichIframeSrc(src) ?? safeEditorYoutubeSrc(src);
  if (!safe) return null;
  const original = node.attrs.originalAttributes as FrameAttributes | null;
  return {
    src: safe,
    title: original?.title || i18n.t('video.embeddedTitle'),
    width: String(node.attrs.width ?? options.width),
    height: String(node.attrs.height ?? options.height),
    class: options.HTMLAttributes.class ?? '',
    allow: FRAME_ALLOW,
    allowfullscreen: '',
    frameborder: '0',
  };
}

/** A NodeView renders only a verified URL. Original attrs are used solely by the serializer. */
export function createView(
  initial: ProseMirrorNode,
  editor: Editor,
  getPos: () => number | undefined,
  options: Options,
) {
  let node = initial;
  const dom = document.createElement('div');
  dom.setAttribute('data-youtube-video', '');
  dom.setAttribute('role', 'group');
  dom.setAttribute('aria-label', i18n.t('video.embeddedTitle'));
  dom.contentEditable = 'false';

  const render = () => {
    dom.replaceChildren();
    const attributes = safeFrameAttributes(node, options);
    if (attributes) {
      const frame = document.createElement('iframe');
      for (const [name, value] of Object.entries(attributes)) frame.setAttribute(name, value);
      dom.append(frame);
      return;
    }
    const notice = document.createElement('p');
    notice.setAttribute('role', 'status');
    notice.setAttribute('aria-live', 'polite');
    notice.className = 'text-sm text-text-muted';
    notice.textContent = i18n.t('video.editorUnavailable');
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.setAttribute('aria-label', i18n.t('video.removeEmbedded'));
    remove.className = 'text-sm underline p-2 min-h-6 min-w-6';
    remove.textContent = i18n.t('video.removeEmbedded');
    remove.addEventListener('click', () => {
      const position = getPos();
      if (typeof position === 'number')
        editor
          .chain()
          .focus()
          .deleteRange({ from: position, to: position + node.nodeSize })
          .run();
    });
    dom.append(notice, remove);
  };
  render();
  i18n.on('languageChanged', render);
  return {
    dom,
    update(next: ProseMirrorNode) {
      if (next.type !== node.type) return false;
      node = next;
      render();
      return true;
    },
    stopEvent: (event: Event) => event.target instanceof HTMLButtonElement,
    ignoreMutation: () => true,
    destroy: () => {
      i18n.off('languageChanged', render);
    },
  };
}
