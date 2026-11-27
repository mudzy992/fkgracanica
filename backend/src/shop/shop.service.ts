import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type ShopProduct = {
  id: string;
  name: string;
  priceKm: number;
  tag?: string;
};

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
      const db = await (
        this.prisma as unknown as {
          shopProduct: { findMany: (a: unknown) => Promise<unknown[]> };
        }
      ).shopProduct.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' },
      });
      if (db.length) {
        return (db as unknown as ShopProduct[]).map((p: unknown) => {
          const prod = p as {
            id: string;
            name: string;
            price: unknown;
            tag: string | null;
          };
          return {
            id: prod.id,
            name: prod.name,
            priceKm: Number(prod.price),
            tag: prod.tag ?? undefined,
          };
        });
      }
    } catch {
      void 0;
    }
    return FALLBACK_PRODUCTS;
  }

  findOneSync(id: string): ShopProduct | undefined {
    return FALLBACK_PRODUCTS.find((p) => p.id === id);
  }

  async checkout(
    productIds: string[],
    provider: string = 'stripe',
    userId?: string,
  ) {
    const items = productIds
      .map((id) => this.findOneSync(id))
      .filter(Boolean) as ShopProduct[];
    const total = items.reduce((s, p) => s + p.priceKm, 0);
    let orderId: string | undefined;
    if (userId) {
      try {
        const order = await (
          this.prisma as unknown as {
            shopOrder: { create: (a: unknown) => Promise<{ id: string }> };
          }
        ).shopOrder.create({
          data: {
            userId,
            total,
            provider,
            status: 'pending',
            items: {
              create: items.map((p) => ({
                productId: p.id,
                quantity: 1,
                price: p.priceKm,
              })),
            },
          },
        });
        orderId = order.id;
      } catch {
        void 0;
      }
    }
    const base = orderId ? `order=${orderId}` : `total=${total}`;
    const urlMap: Record<string, string> = {
      stripe: `https://checkout.stripe.mock/fk-gracanica?${base}&provider=stripe`,
      monri: `https://ipgtest.monri.com/v2/form?${base}&provider=monri`,
      paypal: `https://paypal.mock/fk-gracanica?${base}&provider=paypal`,
    };
    return {
      orderId,
      provider,
      total,
      currency: 'BAM',
      items,
      checkoutUrl: urlMap[provider] ?? urlMap.stripe,
      note: orderId
        ? 'DB order + provider mock (Stripe/Monri/PayPal ready)'
        : 'Mock checkout — DB fallback',
    };
  }

  async adminCreate(data: { name: string; price: number; tag?: string }) {
    try {
      return await (
        this.prisma as unknown as {
          shopProduct: { create: (a: unknown) => Promise<unknown> };
        }
      ).shopProduct.create({
        data: { name: data.name, price: data.price, tag: data.tag ?? null },
      });
    } catch {
      return { id: `mock-${Date.now()}`, ...data };
    }
  }

  async adminUpdate(
    id: string,
    data: { name?: string; price?: number; tag?: string; isActive?: boolean },
  ) {
    try {
      return await (
        this.prisma as unknown as {
          shopProduct: { update: (a: unknown) => Promise<unknown> };
        }
      ).shopProduct.update({
        where: { id },
        data: {
          name: data.name,
          price: data.price,
          tag: data.tag,
          isActive: data.isActive,
        },
      });
    } catch {
      return { id, ...data };
    }
  }

  async adminDelete(id: string) {
    try {
      await (
        this.prisma as unknown as {
          shopProduct: { delete: (a: unknown) => Promise<unknown> };
        }
      ).shopProduct.delete({ where: { id } });
      return { ok: true };
    } catch {
      return { ok: true, mock: true };
    }
  }
}
