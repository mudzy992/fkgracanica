import { StyleSheet } from 'react-native';
import { RemoteImage } from '../RemoteImage';
import { usePublicSettings } from '../../lib/use-public-settings';

export function LoginCrest() {
  const settings = usePublicSettings();
  const crestUrl = settings['club.crestUrl'];
  if (!crestUrl) return null;
  return <RemoteImage path={crestUrl} variant="original" contentFit="contain" transparent style={styles.crest} />;
}

const styles = StyleSheet.create({
  crest: { width: 88, height: 88, alignSelf: 'center', marginBottom: 8 },
});
