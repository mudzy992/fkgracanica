import { Injectable } from '@nestjs/common';

export type ShopProduct = { id: string; name: string; priceKm: number; tag?: string };

const PRODUCTS: ShopProduct[] = [
  { id: 'dres-domaci', name: 'Dres domaći 24/25', priceKm: 79, tag: 'Hit' },
  { id: 'dres-gostujuci', name: 'Dres gostujući', priceKm: 79, tag: 'Novo' },
  { id: 'sal', name: 'Šal FK Gračanica', priceKm: 25, tag: 'Top' },
  { id: 'kapa', name: 'Kapa crno-crvena', priceKm: 22 },
  { id: 'salica', name: 'Šalica 330ml', priceKm: 15 },
  { id: 'privjesak', name: 'Privjesak grb', priceKm: 8 },
];

@Injectable()
export class ShopService {
  findAll(): ShopProduct[] {
    return PRODUCTS;
  }

  findOne(id: string): ShopProduct | undefined {
    return PRODUCTS.find((p) => p.id === id);
  }

  checkout(productIds: string[], provider: string = 'stripe') {
    const items = productIds.map((id) => this.findOne(id)).filter(Boolean) as ShopProduct[];
    const total = items.reduce((s, p) => s + p.priceKm, 0);
    // Mock Stripe/Monri — vraća checkout URL bez realnog provider poziva (P-PREMIUM-03 S)
    return {
      provider,
      total,
      currency: 'BAM',
      items,
      checkoutUrl: `https://checkout.mock/fk-gracanica?total=${total}&provider=${provider}`,
      note: 'Mock checkout — Stripe/Monri integracija u P-PREMIUM-04',
    };
  }
}
