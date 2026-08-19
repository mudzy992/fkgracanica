import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { parseYouTubeId } from '../../lib/youtube-id';
import { youtubeEmbedHtml, youtubeEmbedOrigin } from '../../lib/youtube-embed';

type Props = { url: string; hidden?: boolean; variant?: 'fill' | 'strip' };

export function LiveStreamPlayer({ url, hidden, variant = 'strip' }: Props) {
  const id = parseYouTubeId(url);
  if (!id || hidden) return null;
  const fill = variant === 'fill';
  return (
    <View style={fill ? styles.fillHost : styles.stripHost} collapsable={false}>
      <WebView
        style={styles.web}
        originWhitelist={['*']}
        source={{ html: youtubeEmbedHtml(id, !fill), baseUrl: youtubeEmbedOrigin() }}
        allowsInlineMediaPlayback
        allowsFullscreenVideo={false}
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled
        domStorageEnabled
        setSupportMultipleWindows={false}
        androidLayerType="hardware"
        onShouldStartLoadWithRequest={() => true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fillHost: { ...StyleSheet.absoluteFillObject, zIndex: 0, backgroundColor: '#000' },
  stripHost: { width: '100%', aspectRatio: 16 / 9, backgroundColor: '#000' },
  web: { flex: 1, backgroundColor: '#000', opacity: 0.99 },
});
