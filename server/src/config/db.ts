import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

const envPath = path.join(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const isProduction = process.env.NODE_ENV === 'production';
const dbUrl =
  process.env.DATABASE_URL?.trim() ||
  (!isProduction ? 'postgresql://postgres:pass@123@localhost:5432/matrimonial_db?schema=public' : undefined);

if (!dbUrl) {
  console.error('❌ FATAL: DATABASE_URL environment variable is not set in production.');
} else {
  const maskedHost = dbUrl.replace(/^.*@([^/?]+).*$/, '$1');
  console.log(`🗄️ Prisma database host configured: ${maskedHost}`);
}

export const prisma = new PrismaClient({
  ...(dbUrl ? { datasources: { db: { url: dbUrl } } } : {}),
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

export default prisma;
