'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type CartItem = { id: string; name: string; priceKm: number; qty: number };

const KEY = 'fk_cart';

type CartCtx = {
  items: CartItem[];
  add: (p: { id: string; name: string; priceKm: number }) => void;
  remove: (id: string) => void;
  clear: () => void;
  total: number;
  count: number;
};

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const add = useCallback((p: { id: string; name: string; priceKm: number }) => {
    setItems((prev) => {
      const ex = prev.find((x) => x.id === p.id);
      if (ex) return prev.map((x) => (x.id === p.id ? { ...x, qty: x.qty + 1 } : x));
      return [...prev, { ...p, qty: 1 }];
    });
  }, []);

  const remove = useCallback((id: string) => setItems((prev) => prev.filter((x) => x.id !== id)), []);
  const clear = useCallback(() => setItems([]), []);
  const total = useMemo(() => items.reduce((s, x) => s + x.priceKm * x.qty, 0), [items]);
  const count = useMemo(() => items.reduce((s, x) => s + x.qty, 0), [items]);

  return <Ctx.Provider value={{ items, add, remove, clear, total, count }}>{children}</Ctx.Provider>;
}

export function useCart() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useCart must be inside CartProvider');
  return v;
}
