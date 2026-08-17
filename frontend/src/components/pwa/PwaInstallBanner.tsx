import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '../ui/button';

const STORAGE_KEY = 'fk_pwa_install_dismissed';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

export function PwaInstallBanner() {
  const { pathname } = useLocation();
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [hidden, setHidden] = useState(() => localStorage.getItem(STORAGE_KEY) === '1');

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  if (hidden || !event || pathname.startsWith('/admin')) return null;

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setHidden(true);
  };

  const install = async () => {
    await event.prompt();
    const { outcome } = await event.userChoice;
    if (outcome === 'accepted') dismiss();
    setEvent(null);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-6xl px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border-subtle)] bg-background/95 px-4 py-3 shadow-lg backdrop-blur-md">
        <p className="text-sm text-text">Instaliraj FK Gračanica na početni ekran.</p>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={dismiss}>
            Ne sada
          </Button>
          <Button size="sm" onClick={() => void install()}>
            Instaliraj
          </Button>
        </div>
      </div>
    </div>
  );
}
