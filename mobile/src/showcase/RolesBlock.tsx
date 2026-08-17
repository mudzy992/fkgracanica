import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../lib/theme-context';
import { spacing, typography } from '../lib/theme';
import type { ShowcaseRole } from './types';

export function RolesBlock({ roles }: { roles: ShowcaseRole[] }) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.wrap}>
      <Text style={[styles.heading, { color: colors.text }]}>Uloge i zadaci</Text>
      {roles.map((role) => (
        <View key={role.id} style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.text }]}>{role.title}</Text>
          <Text style={[styles.who, { color: colors.textMuted }]}>{role.who}</Text>
          {role.tasks.map((task) => (
            <Text key={task} style={[styles.task, { color: colors.text }]}>
              • {task}
            </Text>
          ))}
          {role.home?.length ? (
            <>
              <Text style={[styles.homeLabel, { color: colors.textMuted }]}>{t('homeOnScreen')}</Text>
              {role.home.map((item) => (
                <Text key={item} style={[styles.task, { color: colors.text }]}>
                  • {item}
                </Text>
              ))}
            </>
          ) : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm, marginBottom: spacing.md },
  heading: { ...typography.heading, fontSize: 20, marginBottom: spacing.xs },
  card: { borderRadius: 16, borderWidth: 1, gap: 6, padding: spacing.md },
  title: { fontSize: 16, fontWeight: '700' },
  who: { ...typography.caption },
  task: { ...typography.caption, lineHeight: 20 },
  homeLabel: { ...typography.caption, marginTop: spacing.sm, fontWeight: '700', textTransform: 'uppercase' },
});
