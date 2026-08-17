import type { ReactNode } from 'react';
import { Seo } from '../../../components/seo/Seo';

export function RoleHomeShell({
  title,
  seo,
  hint,
  children,
}: {
  title: string;
  seo: string;
  hint: string;
  children: ReactNode;
}) {
  return (
    <>
      <Seo title={seo} />
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text">{title}</h1>
        <p className="mt-1 text-sm text-text-muted">{hint}</p>
      </div>
      {children}
    </>
  );
}
