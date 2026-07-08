import type { WidgetConfigMap } from '../schemas';

export type HeroBackgroundDisplay = WidgetConfigMap['hero']['backgroundDisplay'];

export function heroBackgroundImageClass(display: HeroBackgroundDisplay = 'all'): string {
  switch (display) {
    case 'desktop':
      return 'hidden lg:block';
    case 'mobile':
      return 'lg:hidden';
    case 'none':
      return 'hidden';
    default:
      return '';
  }
}

export function heroBackgroundOnMobile(display: HeroBackgroundDisplay = 'all'): boolean {
  return display === 'all' || display === 'mobile';
}

export function heroBackgroundOnDesktop(display: HeroBackgroundDisplay = 'all'): boolean {
  return display === 'all' || display === 'desktop';
}
