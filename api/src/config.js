import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../.env') });

const databaseUrl = process.env.DATABASE_URL || process.env.DATABASE_PRIVATE_URL;
if (!databaseUrl && process.env.NODE_ENV !== 'test') {
  console.error('FATAL: DATABASE_URL environment variable is not set.');
  console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('DATA') || k.includes('PG') || k.includes('POSTGRES')).join(', '));
  process.exit(1);
}

const nodeEnv = process.env.NODE_ENV || 'development';
const jwtSecret = process.env.JWT_SECRET || (nodeEnv === 'production' ? null : 'bbi-dev-secret-change-in-production');
if (nodeEnv === 'production' && !jwtSecret) {
  console.error('FATAL: JWT_SECRET environment variable is required in production');
  process.exit(1);
}

export default {
  port: parseInt(process.env.PORT || process.env.API_PORT || '3001', 10),
  databaseUrl: databaseUrl || '',
  nodeEnv,
  adminApiKey: process.env.ADMIN_API_KEY || null,
  jwtSecret,
  smtpHost: process.env.SMTP_HOST || null,
  smtpPort: parseInt(process.env.SMTP_PORT, 10) || 587,
  smtpUser: process.env.SMTP_USER || null,
  smtpPass: process.env.SMTP_PASS || null,
  emailFrom: process.env.EMAIL_FROM || 'noreply@battlebornintel.com',
};
