import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../.env') });

export default {
  port: parseInt(process.env.API_PORT || '3001', 10),
  databaseUrl:
    process.env.DATABASE_URL ||
    'postgresql://bbi:bbi_dev_password@localhost:5433/battlebornintel',
  nodeEnv: process.env.NODE_ENV || 'development',
};
