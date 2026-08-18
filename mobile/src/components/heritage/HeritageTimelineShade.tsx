import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

/** Web ClubStoryChapterBg: radial + to-right + to-top. */
export function HeritageTimelineShade() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={['rgba(0,102,255,0.16)', 'transparent']}
        locations={[0, 0.55]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['rgba(5,10,20,0.94)', 'transparent']}
        locations={[0, 0.45]}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['rgba(5,10,20,0.88)', 'rgba(30,58,138,0.55)']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}
