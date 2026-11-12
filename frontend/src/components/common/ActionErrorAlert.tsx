import { useEffect, useSyncExternalStore } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, X } from 'lucide-react';
import {
  clearActionError,
  getActionError,
  subscribeActionError,
} from '../../lib/action-errors';

/** Koliko dugo traka ostaje prije nego se sama skloni. */
export const ACTION_ERROR_TIMEOUT_MS = 8000;

/**
 * P-FE06-44: jedna globalna traka za greške akcija. Ranije su akcije koje se
 * pokreću bez čekanja (`void mutateAsync`) padale tiho — bez poruke i bez
 * promjene stanja. Traka je montirana iznad cijele aplikacije, pa radi i na
 * javnim stranicama i u adminu.
 */
export function ActionErrorAlert() {
  const error = useSyncExternalStore(subscribeActionError, getActionError, getActionError);
  const { t } = useTranslation();

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(clearActionError, ACTION_ERROR_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [error]);

  if (!error) return null;

  const message = error.kind === 'message' ? error.message : t(error.key);

  return (
    <div
      role="alert"
      className="fixed inset-x-0 top-0 z-[100] flex items-start justify-center px-3 pt-3"
    >
      <div className="flex w-full max-w-2xl items-start gap-3 rounded-xl border border-danger/40 bg-background/95 p-3 shadow-lg backdrop-blur">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-danger" aria-hidden="true" />
        <p className="min-w-0 flex-1 text-sm text-text">{message}</p>
        <button
          type="button"
          onClick={clearActionError}
          aria-label={t('actions.close')}
          className="shrink-0 rounded p-1 text-text-muted transition hover:text-text"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
