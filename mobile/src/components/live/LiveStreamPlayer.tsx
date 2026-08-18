import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { parseYouTubeId } from '../../lib/youtube-id';

type Props = { url: string; hidden?: boolean };

export function LiveStreamPlayer({ url, hidden }: Props) {
  const id = parseYouTubeId(url);
  if (!id || hidden) return null;
  return (
    <WebView
      style={styles.web}
      source={{ uri: `https://www.youtube.com/embed/${id}?playsinline=1&rel=0` }}
      allowsInlineMediaPlayback
      mediaPlaybackRequiresUserAction={false}
      javaScriptEnabled
    />
  );
}

const styles = StyleSheet.create({
  web: { width: '100%', aspectRatio: 16 / 9, backgroundColor: '#000' },
});
