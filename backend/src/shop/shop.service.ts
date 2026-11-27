import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type ShopProduct = { id: string; name: string; priceKm: number; tag?: string };

const FALLBACK_PRODUCTS: ShopProduct[] = [
  { id: 'dres-domaci', name: 'Dres domaći 24/25', priceKm: 79, tag: 'Hit' },
  { id: 'dres-gostujuci', name: 'Dres gostujući', priceKm: 79, tag: 'Novo' },
  { id: 'sal', name: 'Šal FK Gračanica', priceKm: 25, tag: 'Top' },
  { id: 'kapa', name: 'Kapa crno-crvena', priceKm: 22 },
  { id: 'salica', name: 'Šalica 330ml', priceKm: 15 },
  { id: 'privjesak', name: 'Privjesak grb', priceKm: 8 },
];

@Injectable()
export class ShopService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<ShopProduct[]> {
    try {
      const db = await (this.prisma as unknown as { shopProduct: { findMany: (a: unknown) => Promise<unknown[]> } }).shopProduct.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' },
      });
      if (db.length) {
        return (db as unknown as ShopProduct[]).map((p: unknown) => {
          const prod = p as { id: string; name: string; price: unknown; tag: string | null };
          return { id: prod.id, name: prod.name, priceKm: Number(prod.price), tag: prod.tag ?? undefined };
        });
      }
    } catch {}
    return FALLBACK_PRODUCTS;
  }

  findOneSync(id: string): ShopProduct | undefined {
    return FALLBACK_PRODUCTS.find((p) => p.id === id);
  }

  async checkout(productIds: string[], provider: string = 'stripe', userId?: string) {
    const items = productIds.map((id) => this.findOneSync(id)).filter(Boolean) as ShopProduct[];
    const total = items.reduce((s, p) => s + p.priceKm, 0);
    // P-PREMIUM-04: DB ShopOrder + Stripe/Monri provider (mock ako nije konfigurisan)
    if (userId) {
      try {
        const order = await (this.prisma as unknown as { shopOrder: { create: (a: unknown) => Promise<{ id: string }> } }).shopOrder.create({
          data: {
            userId,
            total,
            provider,
            status: 'pending',
            items: {
              create: items.map((p) => ({ productId: p.id, quantity: 1, price: p.priceKm })),
            },
          },
        });
        return {
          orderId: order.id,
          provider,
          total,
          currency: 'BAM',
          items,
          checkoutUrl: `https://checkout.mock/fk-gracanica?order=${order.id}&provider=${provider}`,
          note: 'DB order kreiran — Stripe/Monri u P-PREMIUM-04 + PaymentsService',
        };
      } catch {}
    }
    return {
      provider,
      total,
      currency: 'BAM',
      items,
      checkoutUrl: `https://checkout.mock/fk-gracanica?total=${total}&provider=${provider}`,
      note: 'Mock checkout — DB fallback',
    };
  }
}
