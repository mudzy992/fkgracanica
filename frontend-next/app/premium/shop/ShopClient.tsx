'use client';

import { useCart } from '@/lib/cart';

export function AddToCart({ id, name, priceKm }: { id: string; name: string; priceKm: number }) {
  const { add } = useCart();
  return (
    <button
      type="button"
      onClick={() => add({ id, name, priceKm })}
      className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary text-sm font-semibold text-white hover:bg-primary/90"
    >
      Dodaj u korpu
    </button>
  );
}
