import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './lib/auth';
import { ThemeProvider } from './lib/theme';
import './i18n';
import './index.css';
import App from './App';

/** P-FE06-42: bootstrap je izdvojen iz `main.tsx` da ga test može izvršiti. */
export const queryClientDefaults = {
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
};

/** SW se registruje samo u produkcijskoj gradnji i samo kad ga browser podržava. */
export function registerServiceWorker() {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js');
  });
}

export function bootstrap(container: HTMLElement = document.getElementById('root')!) {
  const queryClient = new QueryClient(queryClientDefaults);
  registerServiceWorker();
  createRoot(container).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </StrictMode>,
  );
  return { queryClient };
}
