import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import type { ShowcaseModule } from '../../showcase/types';
import { BAR_CLASS, SURFACE_LABELS } from './group-meta';

function ModuleRow({ mod }: { mod: ShowcaseModule }) {
  return (
    <li className="border-t border-[var(--border-subtle)] py-3 first:border-t-0 first:pt-0">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-medium text-text">{mod.title}</p>
        <p className="shrink-0 tabular-nums text-sm text-text-muted">{mod.percent}%</p>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface">
        <div
          className={`h-full rounded-full ${BAR_CLASS[mod.badge]}`}
          style={{ width: `${mod.percent}%` }}
        />
      </div>
      <p className="mt-1.5 text-xs leading-relaxed text-text-muted">{mod.summary}</p>
      <p className="mt-1 text-[10px] uppercase tracking-wider text-text-muted/80">
        {mod.surfaces.map((s) => SURFACE_LABELS[s]).join(' · ')}
      </p>
    </li>
  );
}

export function StatusGroupCard({
  label,
  modules,
}: {
  label: string;
  modules: ShowcaseModule[];
}) {
  const { t } = useTranslation();
  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex-row items-baseline justify-between space-y-0">
        <CardTitle className="text-sm font-semibold">{label}</CardTitle>
        <span className="tabular-nums text-xs text-text-muted">{modules.length}</span>
      </CardHeader>
      <CardContent className="flex-1 pt-0">
        {modules.length ? (
          <ul>
            {modules.map((mod) => (
              <ModuleRow key={mod.id} mod={mod} />
            ))}
          </ul>
        ) : (
          <p className="text-sm text-text-muted">{t('admin.stanjeEmpty')}</p>
        )}
      </CardContent>
    </Card>
  );
}
