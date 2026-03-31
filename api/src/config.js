import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../.env') });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl && process.env.NODE_ENV !== 'test') {
  console.error('WARNING: DATABASE_URL environment variable is not set — DB queries will fail');
}

if (process.env.NODE_ENV === 'production' && !process.env.ADMIN_API_KEY) {
  console.error('FATAL: ADMIN_API_KEY environment variable is required in production');
  process.exit(1);
}

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is required in production');
  process.exit(1);
}

export default {
  port: parseInt(process.env.PORT || process.env.API_PORT || '3001', 10),
  databaseUrl: databaseUrl || '',
  nodeEnv: process.env.NODE_ENV || 'development',
  adminApiKey: process.env.ADMIN_API_KEY || null,
  jwtSecret: process.env.JWT_SECRET || 'dev-jwt-secret-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
};
