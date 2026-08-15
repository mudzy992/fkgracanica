import { Outlet, useSearchParams } from 'react-router-dom';
import { useModuleFlags } from '../../hooks';
import { ShowcasePage } from '../../pages/showcase/ShowcasePage';
import { isShowcaseModeOn } from '../../pages/showcase/types';

export function ShowcaseGate() {
  const { data: flags, isLoading } = useModuleFlags();
  const [params] = useSearchParams();
  const preview = params.get('showcase') === '1';
  const modeOn = isShowcaseModeOn(flags?.['feature.showcaseMode']);

  if (isLoading && !preview) return null;
  if (modeOn || preview) return <ShowcasePage />;
  return <Outlet />;
}
