import { useMemo, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { newsBodyEditorHtml } from './news-body-html';

type Props = {
  html: string;
  onChangeHtml: (html: string) => Promise<void>;
  onRequestImage: () => Promise<string | null>;
};

export default function NewsBodyDomEditor({ html, onChangeHtml, onRequestImage }: Props) {
  const viewRef = useRef<WebView>(null);
  const seed = useRef(html);
  const source = useMemo(() => ({ html: newsBodyEditorHtml(seed.current) }), []);

  const onMessage = (event: WebViewMessageEvent) => {
    try {
      const payload = JSON.parse(event.nativeEvent.data) as { type?: string; html?: string };
      if (payload.type === 'html' && typeof payload.html === 'string') {
        void onChangeHtml(payload.html);
        return;
      }
      if (payload.type === 'image') {
        void onRequestImage().then((src) => {
          if (!src) return;
          viewRef.current?.injectJavaScript(`window.insertImage(${JSON.stringify(src)}); true;`);
        });
      }
    } catch {
      return;
    }
  };

  return (
    <WebView
      ref={viewRef}
      source={source}
      originWhitelist={['*']}
      onMessage={onMessage}
      hideKeyboardAccessoryView
      nestedScrollEnabled
      style={styles.web}
      androidLayerType="hardware"
    />
  );
}

const styles = StyleSheet.create({
  web: { height: 360, width: '100%', backgroundColor: '#050A14' },
});
