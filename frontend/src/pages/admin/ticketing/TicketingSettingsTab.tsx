import { useEffect, useState } from 'react';
import { useTicketingAdminConfig, useUpdateTicketingAdminConfig } from '../../../hooks/use-ticketing-admin';
import { TicketingCategoriesEditor } from './TicketingCategoriesEditor';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Switch } from '../../../components/ui/switch';
import type { TicketCategory } from '../../../types/ticketing-config';

export function TicketingSettingsTab() {
  const { data, isLoading } = useTicketingAdminConfig();
  const save = useUpdateTicketingAdminConfig();
  const [capacity, setCapacity] = useState('5000');
  const [discount, setDiscount] = useState('10');
  const [maxPerUser, setMaxPerUser] = useState('4');
  const [boxOffice, setBoxOffice] = useState(true);
  const [categories, setCategories] = useState<TicketCategory[]>([]);

  useEffect(() => {
    if (!data) return;
    setCapacity(data.settings['ticketing.stadiumCapacity'] || '5000');
    setDiscount(data.settings['ticketing.memberDiscountPercent'] || '10');
    setMaxPerUser(data.settings['ticketing.maxBoxOfficeTicketsPerUser'] || '4');
    setBoxOffice(data.settings['ticketing.boxOfficeEnabled'] !== 'false');
    setCategories(data.categories);
  }, [data]);

  const onSave = () => {
    void save.mutateAsync({
      'ticketing.stadiumCapacity': capacity,
      'ticketing.memberDiscountPercent': discount,
      'ticketing.maxBoxOfficeTicketsPerUser': maxPerUser,
      'ticketing.boxOfficeEnabled': String(boxOffice),
      'ticketing.categories': JSON.stringify(categories),
    });
  };

  if (isLoading) return <p className="text-sm text-text-muted">Učitavanje...</p>;

  return (
    <div className="space-y-6 p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-text-muted">Kapacitet stadiona</label>
          <Input value={capacity} onChange={(e) => setCapacity(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm text-text-muted">Popust za članove (%)</label>
          <Input value={discount} onChange={(e) => setDiscount(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm text-text-muted">Maks. ulaznica po korisniku (blagajna)</label>
          <Input value={maxPerUser} onChange={(e) => setMaxPerUser(e.target.value)} />
          <p className="mt-1 text-xs text-text-muted">Online plaćanje nema ovaj limit.</p>
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <Switch checked={boxOffice} onCheckedChange={setBoxOffice} />
        Kupovina na blagajni omogućena
      </label>
      <div>
        <h3 className="mb-2 text-sm font-semibold">Kategorije ulaznica</h3>
        <TicketingCategoriesEditor categories={categories} onChange={setCategories} />
      </div>
      <Button onClick={onSave} disabled={save.isPending}>
        {save.isPending ? 'Spremanje...' : 'Spremi postavke'}
      </Button>
    </div>
  );
}
