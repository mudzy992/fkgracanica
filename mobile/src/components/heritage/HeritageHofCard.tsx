import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type NativeSyntheticEvent,
  type TextLayoutEventData,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { RemoteImage } from '../RemoteImage';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';
import type { HeritageItem } from './load-heritage';

const GOLD = '#C9A227';

type Props = { item: HeritageItem };

export function HeritageHofCard({ item }: Props) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState((item.description?.length ?? 0) > 300);

  const handleTextLayout = (e: NativeSyntheticEvent<TextLayoutEventData>) => {
    if (expanded) return;
    const lineCount = e.nativeEvent.lines.length;
    if (lineCount < 5) {
      setCanExpand(false);
    } else if (lineCount === 5) {
      setCanExpand((item.description?.length ?? 0) > 300);
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.background, borderColor: `${GOLD}33` }]}>
      <View style={styles.glow} />
      <View style={[styles.ring, { backgroundColor: colors.background }]}>
        {item.imagePath ? (
          <RemoteImage path={item.imagePath} variant="original" contentFit="cover" style={styles.photo} />
        ) : (
          <View style={[styles.fallback, { backgroundColor: colors.surface }]}>
            <Text style={styles.initial}>{item.title[0]}</Text>
          </View>
        )}
      </View>
      {item.years ? <Text style={styles.years}>{item.years}</Text> : null}
      <Text style={[styles.name, { color: colors.text }]}>{item.title}</Text>
      <View style={styles.rule} />
      {item.role ? <Text style={styles.role}>{item.role}</Text> : null}
      {item.description ? (
        <>
          <Text
            style={[styles.bio, { color: colors.textMuted }]}
            numberOfLines={expanded ? undefined : 5}
            onTextLayout={handleTextLayout}
          >
            {item.description}
          </Text>
          {canExpand && !expanded ? (
            <Pressable
              onPress={() => setExpanded(true)}
              accessibilityRole="button"
              accessibilityLabel={t('readMore')}
            >
              <Text style={styles.readMore}>{t('readMore')}</Text>
            </Pressable>
          ) : null}
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    marginHorizontal: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    borderWidth: 1,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 6,
  },
  glow: {
    position: 'absolute',
    top: 28,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(201,162,39,0.12)',
  },
  ring: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: GOLD,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  photo: { width: '100%', height: '100%' },
  fallback: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  initial: { ...typography.display, color: GOLD },
  years: {
    ...typography.caption,
    color: GOLD,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  name: { ...typography.display, fontSize: 24, textAlign: 'center' },
  rule: { width: 40, height: 2, backgroundColor: GOLD, marginVertical: spacing.sm, borderRadius: 1 },
  role: {
    ...typography.caption,
    color: GOLD,
    fontWeight: '800',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  bio: {
    ...typography.body,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: spacing.sm,
    maxWidth: 320,
  },
  readMore: { ...typography.caption, color: GOLD, fontWeight: '700', marginTop: spacing.xs },
});
