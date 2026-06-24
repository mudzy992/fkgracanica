import { Global, Injectable, Module, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly redis: Redis | null;

  constructor() {
    const url = process.env.REDIS_URL;
    this.redis = url ? new Redis(url, { maxRetriesPerRequest: 1, lazyConnect: true }) : null;
    void this.redis?.connect().catch(() => undefined);
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.redis) return null;
    const raw = await this.redis.get(`fk:${key}`);
    return raw ? (JSON.parse(raw) as T) : null;
  }

  async set(key: string, value: unknown, ttlSeconds = 300): Promise<void> {
    if (!this.redis) return;
    await this.redis.set(`fk:${key}`, JSON.stringify(value), 'EX', ttlSeconds);
  }

  async del(key: string): Promise<void> {
    if (!this.redis) return;
    await this.redis.del(`fk:${key}`);
  }

  onModuleDestroy() {
    void this.redis?.quit();
  }
}

@Global()
@Module({
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
