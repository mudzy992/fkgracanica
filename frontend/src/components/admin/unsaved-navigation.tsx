import { useCallback, useEffect, useRef, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useBlocker } from 'react-router-dom';
import { UnsavedContext, type DirtyCheck, type Register } from './unsaved-navigation-context';

/** Jedan router blocker za sve otvorene forme, uključujući ugniježđene. */
export function UnsavedNavigationProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const checks = useRef(new Set<DirtyCheck>());
  const handling = useRef(false);
  const register = useCallback<Register>((check) => {
    checks.current.add(check);
    return () => { checks.current.delete(check); };
  }, []);
  const shouldBlock = useCallback(() => [...checks.current].some((check) => check()), []);
  const blocker = useBlocker(shouldBlock);

  useEffect(() => {
    if (blocker.state !== 'blocked') {
      handling.current = false;
      return;
    }
    handling.current = true;
    if (window.confirm(t('admin.unsavedNavigation'))) blocker.proceed();
    else blocker.reset();
  }, [blocker, t]);

  return <UnsavedContext.Provider value={register}>{children}</UnsavedContext.Provider>;
}
