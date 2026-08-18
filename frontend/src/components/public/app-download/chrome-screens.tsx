import { AlertTriangle, Download, FileArchive } from 'lucide-react';
import { TapHint } from './phone-frame';

type Props = { version: string; t: (key: string, opts?: Record<string, string>) => string };

function apkName(version: string) {
  return `fk-gracanica-${version}.apk`;
}

export function ChromePageScreen({ version, t, highlight }: Props & { highlight?: boolean }) {
  const host = typeof window !== 'undefined' ? window.location.host : 'fkgracanica.ba';

  return (
    <div className="flex h-[calc(100%-1.5rem)] flex-col bg-white px-2 pb-5 pt-1">
      <div className="rounded-full bg-zinc-100 px-2 py-1 text-center text-[8px] text-zinc-500">{host}/aplikacija</div>
      <div className="mt-2 flex-1 rounded-lg bg-zinc-50 p-2">
        <p className="text-[9px] font-bold text-zinc-800">{t('appDownload.title')}</p>
        <p className="mt-0.5 text-[7px] text-zinc-500">{t('appDownload.version', { version })}</p>
        <div className="relative mt-3">
          {highlight ? <TapHint label={t('appDownload.mock.tap')} /> : null}
          <div
            className={`flex items-center justify-center gap-1 rounded-md py-1.5 text-[8px] font-semibold text-white ${highlight ? 'bg-blue-600 ring-2 ring-amber-400 ring-offset-1' : 'bg-blue-600'}`}
          >
            <Download className="h-2.5 w-2.5" />
            {t('appDownload.download')}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ChromeWarnScreen({ version, t }: Props) {
  return (
    <div className="relative flex h-[calc(100%-1.5rem)] flex-col bg-zinc-200/80">
      <div className="flex-1 bg-zinc-300/50" />
      <div className="rounded-t-2xl bg-white px-3 pb-6 pt-3 shadow-lg">
        <AlertTriangle className="mx-auto h-7 w-7 text-amber-500" />
        <p className="mt-2 text-center text-[10px] font-semibold leading-tight">{t('appDownload.mock.warnTitle')}</p>
        <p className="mt-1 text-center text-[8px] leading-snug text-zinc-500">
          {t('appDownload.mock.warnBody', { file: apkName(version) })}
        </p>
        <div className="relative mt-3">
          <TapHint label={t('appDownload.mock.tap')} />
          <div className="rounded-md bg-blue-600 py-1.5 text-center text-[9px] font-semibold text-white ring-2 ring-amber-400 ring-offset-1">
            {t('appDownload.mock.warnAnyway')}
          </div>
        </div>
        <div className="mt-1.5 py-1 text-center text-[9px] text-zinc-500">{t('appDownload.mock.warnDiscard')}</div>
      </div>
    </div>
  );
}

export function NotifScreen({ version, t }: Props) {
  return (
    <div className="flex h-[calc(100%-1.5rem)] flex-col bg-gradient-to-b from-slate-400 to-slate-600 px-2 pb-5 pt-2">
      <div className="relative rounded-2xl bg-white/95 p-2.5 shadow">
        <TapHint label={t('appDownload.mock.tap')} />
        <div className="flex items-start gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
            <FileArchive className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-[9px] font-semibold">{t('appDownload.mock.notifTitle')}</p>
            <p className="truncate text-[8px] text-zinc-500">{apkName(version)}</p>
            <p className="mt-1 text-[8px] font-medium text-blue-600">{t('appDownload.mock.notifOpen')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
