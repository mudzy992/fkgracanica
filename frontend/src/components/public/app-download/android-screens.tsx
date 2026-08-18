import { mediaUrl } from '../../../lib/media';
import { TapHint } from './phone-frame';

type Props = {
  version: string;
  clubName: string;
  crestUrl?: string;
  t: (key: string, opts?: Record<string, string>) => string;
};

export function UnknownAppsScreen({ t }: Pick<Props, 't'>) {
  return (
    <div className="flex h-[calc(100%-1.5rem)] flex-col bg-white px-3 pb-5 pt-1">
      <p className="text-[8px] text-zinc-400">{t('appDownload.mock.settingsHint')}</p>
      <p className="mt-1 text-[11px] font-semibold leading-tight">{t('appDownload.mock.settingsTitle')}</p>
      <p className="mt-1 text-[8px] leading-snug text-zinc-500">{t('appDownload.mock.settingsBody')}</p>
      <div className="relative mt-3 rounded-xl bg-zinc-100 p-2.5">
        <TapHint label={t('appDownload.mock.tap')} />
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[10px] font-medium">{t('appDownload.mock.chromeApp')}</p>
            <p className="text-[8px] text-zinc-500">{t('appDownload.mock.allowSource')}</p>
          </div>
          <span className="relative h-4 w-8 rounded-full bg-blue-600 ring-2 ring-amber-400 ring-offset-1">
            <span className="absolute right-0.5 top-0.5 h-3 w-3 rounded-full bg-white" />
          </span>
        </div>
      </div>
    </div>
  );
}

export function InstallerScreen({ version, clubName, crestUrl, t }: Props) {
  const crest = mediaUrl(crestUrl, 'thumb');

  return (
    <div className="flex h-[calc(100%-1.5rem)] flex-col bg-white px-3 pb-5 pt-2">
      <div className="flex items-center gap-2">
        {crest ? (
          <img src={crest} alt="" className="h-9 w-9 rounded-lg object-contain" />
        ) : (
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-800 text-[10px] font-bold text-white">
            FK
          </span>
        )}
        <div>
          <p className="text-[11px] font-semibold leading-tight">{clubName}</p>
          <p className="text-[8px] text-zinc-500">{t('appDownload.version', { version })}</p>
        </div>
      </div>
      <p className="mt-3 text-[10px] font-medium leading-snug">{t('appDownload.mock.installTitle')}</p>
      <p className="mt-1 text-[8px] text-zinc-500">{t('appDownload.mock.playScan')}</p>
      <div className="mt-auto flex gap-2 pb-2">
        <div className="flex-1 rounded-full py-1.5 text-center text-[9px] text-blue-700">
          {t('appDownload.mock.cancel')}
        </div>
        <div className="relative flex-1">
          <TapHint label={t('appDownload.mock.tap')} />
          <div className="rounded-full bg-blue-600 py-1.5 text-center text-[9px] font-semibold text-white ring-2 ring-amber-400 ring-offset-1">
            {t('appDownload.mock.install')}
          </div>
        </div>
      </div>
    </div>
  );
}
