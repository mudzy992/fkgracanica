import { Link } from 'react-router-dom';
import { Button } from '../../../components/ui/button';

export type HomeAction = {
  to: string;
  label: string;
  variant?: 'default' | 'outline';
};

export function HomeQuickActions({ items }: { items: HomeAction[] }) {
  return (
    <div className="mt-6 flex flex-wrap gap-2">
      {items.map((item) => (
        <Link key={`${item.to}-${item.label}`} to={item.to}>
          <Button variant={item.variant ?? 'outline'}>{item.label}</Button>
        </Link>
      ))}
    </div>
  );
}
