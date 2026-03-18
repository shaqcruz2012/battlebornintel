import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../.env') });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl && process.env.NODE_ENV !== 'test') {
  console.error('FATAL: DATABASE_URL environment variable is not set');
  process.exit(1);
}

export default {
  port: parseInt(process.env.API_PORT || '3001', 10),
  databaseUrl: databaseUrl || '',
  nodeEnv: process.env.NODE_ENV || 'development',
  adminApiKey: process.env.ADMIN_API_KEY || null,
  jwtSecret: process.env.JWT_SECRET || 'bbi-dev-secret-change-in-production',
  smtpHost: process.env.SMTP_HOST || null,
  smtpPort: parseInt(process.env.SMTP_PORT) || 587,
  smtpUser: process.env.SMTP_USER || null,
  smtpPass: process.env.SMTP_PASS || null,
  emailFrom: process.env.EMAIL_FROM || 'noreply@battlebornintel.com',
};
