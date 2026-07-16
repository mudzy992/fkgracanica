import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Screen } from '../../src/components/primitives/Screen';
import { SectionHeader } from '../../src/components/primitives/SectionHeader';
import { ListRow } from '../../src/components/primitives/ListRow';
import { useModuleFlags } from '../../src/hooks/use-module-flags';
import { useAuth } from '../../src/lib/auth';
import { isStaffUser } from '../../src/lib/permissions';

export default function MoreScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { isEnabled } = useModuleFlags();
  const canAccessStaff = isStaffUser(user);

  return (
    <Screen scroll>
      <SectionHeader title={t('publicModules')} subtitle="Web content parity entry points" />
      {isEnabled('modules.gallery') ? (
        <ListRow
          title="Galerija"
          subtitle="Albumi i fotografije"
          icon="images-outline"
          onPress={() => router.push('/gallery')}
        />
      ) : null}
      {isEnabled('modules.clubs') ? (
        <ListRow
          title="Tim i klub"
          subtitle="Sastav, klub, igrači"
          icon="people-outline"
          onPress={() => router.push('/team')}
        />
      ) : null}
      {isEnabled('modules.competitions') ? (
        <ListRow
          title="Liga i statistika"
          subtitle="Tabela, raspored, meč centar"
          icon="trophy-outline"
          onPress={() => router.push('/league')}
        />
      ) : null}
      <ListRow
        title="Klupska baština"
        subtitle="Sponzori, trofeji, timeline, muzej"
        icon="ribbon-outline"
        onPress={() => router.push('/heritage')}
      />
      <ListRow
        title="Kontakt i newsletter"
        subtitle="Pošaljite poruku i pratite objave"
        icon="mail-outline"
        onPress={() => router.push('/contact')}
      />
      <ListRow
        title="Pretraga"
        subtitle="Globalna pretraga sadržaja"
        icon="search-outline"
        onPress={() => router.push('/search')}
      />
      {isEnabled('modules.cms') ? (
        <ListRow
          title="CMS stranice"
          subtitle="Read-only pregled objavljenih stranica"
          icon="document-text-outline"
          onPress={() => router.push('/pages')}
        />
      ) : null}
      <SectionHeader title={t('accountTools')} subtitle={isAuthenticated ? user?.email ?? '' : t('guestMode')} />
      {isAuthenticated ? (
        <>
          <ListRow title={t('membership')} icon="id-card-outline" onPress={() => router.push('/(tabs)/membership')} />
          <ListRow title={t('tickets')} icon="ticket-outline" onPress={() => router.push('/(tabs)/tickets')} />
          <ListRow
            title={t('notifications')}
            icon="notifications-outline"
            onPress={() => router.push('/(tabs)/notifications')}
          />
        </>
      ) : (
        <ListRow
          title={t('login')}
          subtitle={t('signInForMemberTools')}
          icon="log-in-outline"
          onPress={() => router.push('/login')}
        />
      )}
      {canAccessStaff ? (
        <>
          <SectionHeader title={t('staffTools')} subtitle={t('staffWorkspaceHint')} />
          <ListRow
            title={t('staffWorkspace')}
            subtitle={t('open')}
            icon="briefcase-outline"
            onPress={() => router.push('/staff')}
          />
        </>
      ) : null}
    </Screen>
  );
}
