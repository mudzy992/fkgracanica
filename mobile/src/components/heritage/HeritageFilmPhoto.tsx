import { StyleSheet, View } from 'react-native';
import { RemoteImage } from '../RemoteImage';

type Props = { path?: string };

export function HeritageFilmPhoto({ path }: Props) {
  if (!path) return null;
  return (
    <View style={styles.wrap} collapsable={false}>
      <RemoteImage path={path} variant="original" contentFit="cover" style={styles.photo} />
      <View pointerEvents="none" style={styles.bw} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: 'hidden',
    isolation: 'isolate',
  },
  photo: { width: '100%', height: '100%', borderRadius: 0 },
  bw: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#fff',
    mixBlendMode: 'saturation',
  },
});
