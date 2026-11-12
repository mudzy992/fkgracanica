import { buttonVariants } from "../../../components/ui/button-variants";
import { cn } from "../../../lib/utils";
import { Link } from 'react-router-dom';
;

export type HomeAction = {
  to: string;
  label: string;
  variant?: 'default' | 'outline';
};

export function HomeQuickActions({ items }: { items: HomeAction[] }) {
  return (
    <div className="mt-6 flex flex-wrap gap-2">
      {items.map((item) => (
        <Link key={`${item.to}-${item.label}`} to={item.to} className={cn(buttonVariants({variant: item.variant ?? 'outline'}))}>{item.label}</Link>
      ))}
    </div>
  );
}
