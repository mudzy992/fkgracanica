import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RemoteImage } from '../RemoteImage';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';
import type { NewsPhoto, NewsRelatedMatch, NewsRelatedPlayer } from './load-news-detail';

type Props = {
  galleryTitle: string;
  photos: NewsPhoto[];
  matchesTitle: string;
  matches: NewsRelatedMatch[];
  playersTitle: string;
  players: NewsRelatedPlayer[];
  onPhotoPress: (index: number) => void;
};

export function NewsRelatedBlock({
  galleryTitle,
  photos,
  matchesTitle,
  matches,
  playersTitle,
  players,
  onPhotoPress,
}: Props) {
  const { colors } = useTheme();
  const router = useRouter();
  return (
    <View style={styles.wrap}>
      {photos.length > 0 ? (
        <View style={styles.block}>
          <Text style={[styles.heading, { color: colors.text }]}>{galleryTitle}</Text>
          {photos.map((photo, index) => (
            <Pressable
              key={photo.id}
              onPress={() => onPhotoPress(index)}
              accessibilityRole="button"
              accessibilityLabel={galleryTitle}
            >
              <RemoteImage path={photo.path} style={styles.photo} />
            </Pressable>
          ))}
        </View>
      ) : null}
      {matches.length > 0 ? (
        <View style={styles.block}>
          <Text style={[styles.heading, { color: colors.text }]}>{matchesTitle}</Text>
          {matches.map((match) => (
            <Pressable
              key={match.id}
              onPress={() => router.push(`/live/${match.id}`)}
              accessibilityRole="button"
              accessibilityLabel={match.label}
            >
              <Text style={[styles.link, { color: colors.link }]}>{match.label}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      {players.length > 0 ? (
        <View style={styles.block}>
          <Text style={[styles.heading, { color: colors.text }]}>{playersTitle}</Text>
          {players.map((player) => (
            <Pressable
              key={player.id}
              onPress={() => router.push(`/player/${player.id}`)}
              accessibilityRole="button"
              accessibilityLabel={player.name}
            >
              <Text style={[styles.link, { color: colors.link }]}>{player.name}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.lg, marginTop: spacing.lg },
  block: { gap: spacing.sm },
  heading: { ...typography.heading },
  photo: { height: 180 },
  link: { ...typography.body, fontWeight: '600' },
});
