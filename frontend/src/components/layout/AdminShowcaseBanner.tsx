import { Link } from 'react-router-dom';
import { useModuleFlags } from '../../hooks';
import { isShowcaseModeOn } from '../../pages/showcase/types';

export function AdminShowcaseBanner() {
  const { data: flags } = useModuleFlags();
  if (!isShowcaseModeOn(flags?.['feature.showcaseMode'])) return null;

  return (
    <div className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-center text-sm text-amber-800 dark:text-amber-200">
      Javnost vidi prezentaciju.{' '}
      <Link to="/platforma" className="font-medium underline">
        Otvori
      </Link>
      {' · '}
      <Link to="/admin/settings" className="font-medium underline">
        Postavke
      </Link>
    </div>
  );
}
