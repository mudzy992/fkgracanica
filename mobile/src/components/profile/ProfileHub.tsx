import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ListRow } from '../primitives/ListRow';
import { SectionHeader } from '../primitives/SectionHeader';
import { RemoteImage } from '../RemoteImage';
import { useAuth } from '../../lib/auth';
import { api } from '../../lib/api';
import { isStaffUser } from '../../lib/permissions';
import { setAppLanguage } from '../../i18n';
import { uploadMedia } from '../../lib/upload-media';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';

export function ProfileHub() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { user, logout, refreshUser } = useAuth();
  const { colors } = useTheme();
  const [busy, setBusy] = useState(false);
  const nextLang = i18n.language === 'en' ? 'bs' : 'en';
  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName ?? ''}`.trim()
    : user?.email ?? '';
  const initials =
    displayName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || '?';

  const handleUpload = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const path = await uploadMedia();
      await api.patch('/auth/profile', { avatarPath: path });
      await refreshUser();
    } catch (error) {
      if (error instanceof Error && error.message === 'cancelled') return;
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (busy || !user?.avatarPath) return;
    setBusy(true);
    try {
      await api.delete('/auth/profile/avatar');
      await refreshUser();
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.wrap}>
      <View style={[styles.hero, { backgroundColor: colors.background }]}>
        {user?.avatarPath ? (
          <RemoteImage
            path={user.avatarPath}
            variant="medium"
            contentFit="cover"
            style={styles.avatar}
          />
        ) : (
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={[styles.initials, { color: colors.white }]}>{initials}</Text>
          </View>
        )}
        <Text style={[styles.name, { color: colors.text }]}>{displayName}</Text>
        <Text style={[styles.email, { color: colors.textMuted }]}>{user?.email}</Text>
        <View style={styles.avatarActions}>
          <Pressable
            style={[styles.avatarBtn, { borderColor: colors.border, opacity: busy ? 0.6 : 1 }]}
            disabled={busy}
            onPress={() => void handleUpload()}
          >
            <Text style={[styles.avatarBtnText, { color: colors.text }]}>
              {user?.avatarPath ? 'Promijeni sliku' : 'Dodaj sliku'}
            </Text>
          </Pressable>
          {user?.avatarPath ? (
            <Pressable
              style={[styles.avatarBtn, { borderColor: colors.border, opacity: busy ? 0.6 : 1 }]}
              disabled={busy}
              onPress={() => void handleDelete()}
            >
              <Text style={[styles.avatarBtnText, { color: colors.danger }]}>Obriši</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
      <SectionHeader title={t('accountTools')} />
      <ListRow title={t('membership')} icon="id-card-outline" onPress={() => router.push('/membership')} />
      <ListRow title={t('tickets')} icon="ticket-outline" onPress={() => router.push('/tickets')} />
      <ListRow title={t('buyTickets')} icon="card-outline" onPress={() => router.push('/tickets-buy')} />
      <ListRow
        title={t('notifications')}
        icon="notifications-outline"
        onPress={() => router.push('/notifications')}
      />
      <SectionHeader title={t('preferences')} />
      <ListRow
        title={t('language')}
        subtitle={i18n.language === 'en' ? t('languageEn') : t('languageBs')}
        icon="language-outline"
        onPress={() => void setAppLanguage(nextLang)}
      />
      {user ? (
        <ListRow
          title={t('livePushToggle')}
          subtitle={t('livePushHint')}
          icon="notifications-outline"
          rightText={user.notifyLiveMatch === false ? 'OFF' : 'ON'}
          onPress={() => {
            void api
              .patch('/auth/preferences', { notifyLiveMatch: user.notifyLiveMatch === false })
              .then(() => refreshUser());
          }}
        />
      ) : null}
      {isStaffUser(user) ? (
        <ListRow title={t('staffWorkspace')} icon="briefcase-outline" onPress={() => router.push('/staff')} />
      ) : null}
      <ListRow title={t('logout')} icon="log-out-outline" onPress={() => void logout()} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  hero: {
    alignItems: 'center',
    borderRadius: 20,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  avatar: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  initials: { ...typography.title, fontSize: 22 },
  name: { ...typography.title, fontWeight: '800', textAlign: 'center' },
  email: { ...typography.caption },
  avatarActions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.sm, marginTop: spacing.xs },
  avatarBtn: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  avatarBtnText: { ...typography.caption, fontWeight: '700' },
});
