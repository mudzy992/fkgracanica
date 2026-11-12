import { SettingScope, SettingType } from '@prisma/client';

export const SHOWCASE_SETTINGS = [
  {
    key: 'feature.showcaseMode',
    value: 'false',
    type: SettingType.BOOLEAN,
    scope: SettingScope.PRIVATE,
    description:
      'Javnost vidi prezentaciju platforme umjesto portala. Admin, prijava i staff rade.',
  },
  {
    key: 'showcase.launchNote',
    value: 'Portal se lansira sa Stripe plaćanjem i blagajnom.',
    type: SettingType.STRING,
    scope: SettingScope.PUBLIC,
    description: 'Kratka napomena o lansiranju na showcase hero',
  },
];
