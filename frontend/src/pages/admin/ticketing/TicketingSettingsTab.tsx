import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useTicketingAdminConfig,
  useUpdateTicketingAdminConfig,
} from '../../../hooks/use-ticketing-admin';
import { TicketingCategoriesEditor } from './TicketingCategoriesEditor';
import { TicketingCardBackgroundField } from './TicketingCardBackgroundField';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Switch } from '../../../components/ui/switch';
import type { TicketCategory } from '../../../types/ticketing-config';
import { runAction } from '../../../lib/action-errors';

export function TicketingSettingsTab() {
  const { t } = useTranslation();
  const { data, isLoading } = useTicketingAdminConfig();
  const save = useUpdateTicketingAdminConfig();
  const [capacity, setCapacity] = useState('5000');
  const [discount, setDiscount] = useState('10');
  const [maxPerUser, setMaxPerUser] = useState('4');
  const [seasonPrice, setSeasonPrice] = useState('0');
  const [seasonLabel, setSeasonLabel] = useState('Sezonska karta');
  const [boxOffice, setBoxOffice] = useState(true);
  const [cardBackground, setCardBackground] = useState('');
  const [categories, setCategories] = useState<TicketCategory[]>([]);

  useEffect(() => {
    if (!data) return;
    setCapacity(data.settings['ticketing.stadiumCapacity'] || '5000');
    setDiscount(data.settings['ticketing.memberDiscountPercent'] || '10');
    setMaxPerUser(data.settings['ticketing.maxBoxOfficeTicketsPerUser'] || '4');
    setSeasonPrice(data.settings['ticketing.seasonPassPrice'] || '0');
    setSeasonLabel(data.settings['ticketing.seasonPassLabel'] || 'Sezonska karta');
    setBoxOffice(data.settings['ticketing.boxOfficeEnabled'] !== 'false');
    setCardBackground(data.settings['ticketing.ticketCardBackground'] || '');
    setCategories(data.categories);
  }, [data]);

  const onSave = () => {
    void runAction(save.mutateAsync({
      'ticketing.stadiumCapacity': capacity,
      'ticketing.memberDiscountPercent': discount,
      'ticketing.maxBoxOfficeTicketsPerUser': maxPerUser,
      'ticketing.seasonPassPrice': seasonPrice,
      'ticketing.seasonPassLabel': seasonLabel,
      'ticketing.boxOfficeEnabled': String(boxOffice),
      'ticketing.ticketCardBackground': cardBackground,
      'ticketing.categories': JSON.stringify(categories),
    }));
  };

  if (isLoading) return <p className="text-sm text-text-muted">{t('admin.common.loading')}</p>;

  return (
    <div className="space-y-6 p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-text-muted">
            {t('admin.ticketingForm.capacity')}
          </label>
          <Input value={capacity} onChange={(e) => setCapacity(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm text-text-muted">
            {t('admin.ticketingForm.memberDiscount')}
          </label>
          <Input value={discount} onChange={(e) => setDiscount(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm text-text-muted">
            {t('admin.ticketingForm.maxPerUser')}
          </label>
          <Input value={maxPerUser} onChange={(e) => setMaxPerUser(e.target.value)} />
          <p className="mt-1 text-xs text-text-muted">{t('admin.ticketingForm.maxPerUserNote')}</p>
        </div>
        <div>
          <label className="mb-1 block text-sm text-text-muted">
            {t('admin.ticketingForm.seasonPrice')}
          </label>
          <Input value={seasonPrice} onChange={(e) => setSeasonPrice(e.target.value)} />
          <p className="mt-1 text-xs text-text-muted">{t('admin.ticketingForm.seasonPriceNote')}</p>
        </div>
        <div>
          <label className="mb-1 block text-sm text-text-muted">
            {t('admin.ticketingForm.seasonLabel')}
          </label>
          <Input value={seasonLabel} onChange={(e) => setSeasonLabel(e.target.value)} />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <Switch checked={boxOffice} onCheckedChange={setBoxOffice} />
        {t('admin.ticketingForm.boxOffice')}
      </label>
      <TicketingCardBackgroundField value={cardBackground} onChange={setCardBackground} />
      <div>
        <h3 className="mb-2 text-sm font-semibold">{t('admin.ticketingForm.categories')}</h3>
        <TicketingCategoriesEditor categories={categories} onChange={setCategories} />
      </div>
      <Button onClick={onSave} disabled={save.isPending}>
        {save.isPending ? t('admin.common.saving') : t('admin.ticketingForm.save')}
      </Button>
    </div>
  );
}
