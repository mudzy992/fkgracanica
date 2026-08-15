import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const LINE = 'rgba(255,255,255,0.32)';
const LINE_SOFT = 'rgba(255,255,255,0.18)';

/** Vertical football pitch markings (mobile / web `< lg` parity). */
export function TeamPitchMarkings() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={['#166534', '#15803D', '#14532D', '#052E16']}
        locations={[0, 0.35, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <View
          key={i}
          style={[
            styles.stripe,
            {
              top: `${i * (100 / 6)}%`,
              height: `${100 / 12}%`,
              backgroundColor: i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent',
            },
          ]}
        />
      ))}
      <View style={[styles.touchline, { borderColor: LINE }]} />
      <View style={[styles.halfway, { backgroundColor: LINE }]} />
      <View style={[styles.centerCircle, { borderColor: LINE }]} />
      <View style={[styles.centerSpot, { backgroundColor: LINE }]} />
      <View style={[styles.penaltyBox, styles.penaltyTop, { borderColor: LINE }]} />
      <View style={[styles.goalBox, styles.goalTop, { borderColor: LINE_SOFT }]} />
      <View style={[styles.penaltySpot, styles.spotTop, { backgroundColor: LINE }]} />
      <View style={[styles.penaltyArc, styles.arcTop, { borderColor: LINE_SOFT }]} />
      <View style={[styles.penaltyBox, styles.penaltyBottom, { borderColor: LINE }]} />
      <View style={[styles.goalBox, styles.goalBottom, { borderColor: LINE_SOFT }]} />
      <View style={[styles.penaltySpot, styles.spotBottom, { backgroundColor: LINE }]} />
      <View style={[styles.penaltyArc, styles.arcBottom, { borderColor: LINE_SOFT }]} />
      <View style={[styles.goalMouth, styles.goalMouthTop, { borderColor: LINE }]} />
      <View style={[styles.goalMouth, styles.goalMouthBottom, { borderColor: LINE }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  stripe: { position: 'absolute', left: 0, right: 0 },
  touchline: {
    position: 'absolute',
    top: '3%',
    bottom: '3%',
    left: '4%',
    right: '4%',
    borderWidth: 2,
    borderRadius: 4,
  },
  halfway: {
    position: 'absolute',
    left: '4%',
    right: '4%',
    top: '50%',
    height: 2,
    marginTop: -1,
  },
  centerCircle: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    left: '50%',
    top: '50%',
    marginLeft: -36,
    marginTop: -36,
  },
  centerSpot: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 3,
    left: '50%',
    top: '50%',
    marginLeft: -2.5,
    marginTop: -2.5,
  },
  penaltyBox: {
    position: 'absolute',
    left: '18%',
    right: '18%',
    height: '16%',
    borderWidth: 2,
  },
  penaltyTop: { top: '3%', borderBottomLeftRadius: 2, borderBottomRightRadius: 2 },
  penaltyBottom: { bottom: '3%', borderTopLeftRadius: 2, borderTopRightRadius: 2 },
  goalBox: {
    position: 'absolute',
    left: '30%',
    right: '30%',
    height: '7%',
    borderWidth: 2,
  },
  goalTop: { top: '3%' },
  goalBottom: { bottom: '3%' },
  penaltySpot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    left: '50%',
    marginLeft: -2,
  },
  spotTop: { top: '14%' },
  spotBottom: { bottom: '14%' },
  penaltyArc: {
    position: 'absolute',
    width: 44,
    height: 22,
    left: '50%',
    marginLeft: -22,
    borderWidth: 2,
  },
  arcTop: {
    top: '18.5%',
    borderTopWidth: 0,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  arcBottom: {
    bottom: '18.5%',
    borderBottomWidth: 0,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  goalMouth: {
    position: 'absolute',
    left: '40%',
    right: '40%',
    height: '2%',
    borderWidth: 2,
  },
  goalMouthTop: { top: '1.2%', borderBottomWidth: 0 },
  goalMouthBottom: { bottom: '1.2%', borderTopWidth: 0 },
});
