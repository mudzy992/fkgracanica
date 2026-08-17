import { Linking, Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { spacing } from '../lib/theme';
import type { MatchHighlight } from '../types/api';

export function MatchHighlightsList({
  highlights,
  textColor,
  accentColor,
}: {
  highlights?: MatchHighlight[];
  textColor: string;
  accentColor: string;
}) {
  const { t } = useTranslation();
  const clips = highlights ?? [];
  if (!clips.length) return null;

  return (
    <View style={{ marginTop: spacing.lg, gap: spacing.sm }}>
      <Text style={{ color: textColor, fontWeight: '600' }}>{t('matchHighlights')}</Text>
      {clips.map((clip) => (
        <Pressable
          key={clip.id}
          onPress={() => void Linking.openURL(clip.youtubeUrl)}
          style={{ paddingVertical: spacing.sm }}
        >
          <Text style={{ color: textColor }}>{clip.title}</Text>
          <Text style={{ color: accentColor, marginTop: 2 }}>{t('openHighlight')}</Text>
        </Pressable>
      ))}
    </View>
  );
}
