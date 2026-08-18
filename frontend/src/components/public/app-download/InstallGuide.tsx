import { useTranslation } from 'react-i18next';
import { usePublicSettings } from '../../../hooks';
import { PremiumCard } from '../shell/PremiumCard';
import { ChromePageScreen, ChromeWarnScreen, NotifScreen } from './chrome-screens';
import { InstallerScreen, UnknownAppsScreen } from './android-screens';
import { PhoneFrame } from './phone-frame';

const STEP_KEYS = ['step1', 'step2', 'step3', 'step4', 'step5', 'step6'] as const;

type Props = { version: string };

export function InstallGuide({ version }: Props) {
  const { t } = useTranslation();
  const { data: settings } = usePublicSettings();
  const clubName = settings?.['club.name']?.trim() || 'FK Gračanica';
  const crestUrl = settings?.['club.crestUrl'] || undefined;

  return (
    <PremiumCard className="p-6 sm:p-8" hover={false}>
      <h2 className="font-display text-xl font-bold text-text sm:text-2xl">{t('appDownload.guideTitle')}</h2>
      <p className="mt-1 text-sm text-text-muted">{t('appDownload.mock.caption')}</p>
      <ol className="mt-8 space-y-10">
        {STEP_KEYS.map((key, i) => (
          <li key={key} className="grid items-center gap-6 border-b border-[var(--border-subtle)] pb-10 last:border-0 last:pb-0 md:grid-cols-[1fr_auto]">
            <div className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
                {i + 1}
              </span>
              <p className="pt-1 text-sm leading-relaxed text-text-muted sm:text-base">
                {t(`appDownload.${key}`, { version })}
              </p>
            </div>
            <PhoneFrame>
              <StepScreen index={i} version={version} clubName={clubName} crestUrl={crestUrl} t={t} />
            </PhoneFrame>
          </li>
        ))}
      </ol>
      <div className="mt-6 space-y-2 border-t border-[var(--border-subtle)] pt-6 text-sm text-text-muted">
        <p>{t('appDownload.playProtect')}</p>
        <p>{t('appDownload.iosNote')}</p>
        <p>{t('appDownload.pwaNote')}</p>
      </div>
    </PremiumCard>
  );
}

function StepScreen({
  index,
  version,
  clubName,
  crestUrl,
  t,
}: {
  index: number;
  version: string;
  clubName: string;
  crestUrl?: string;
  t: (key: string, opts?: Record<string, string>) => string;
}) {
  const chrome = { version, t };
  if (index === 0) return <ChromePageScreen {...chrome} />;
  if (index === 1) return <ChromePageScreen {...chrome} highlight />;
  if (index === 2) return <ChromeWarnScreen {...chrome} />;
  if (index === 3) return <NotifScreen {...chrome} />;
  if (index === 4) return <UnknownAppsScreen t={t} />;
  return <InstallerScreen version={version} clubName={clubName} crestUrl={crestUrl} t={t} />;
}
