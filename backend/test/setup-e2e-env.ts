import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../../.env') });

if (!process.env.REDIS_URL || process.env.REDIS_URL.includes('redis://redis')) {
  process.env.REDIS_URL = 'redis://127.0.0.1:6379';
}
