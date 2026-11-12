import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

const envPath = path.join(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const databaseUrl = process.env.DATABASE_URL?.trim();

if (!databaseUrl) {
  console.error(
    '❌ FATAL: DATABASE_URL environment variable is missing. ' +
      'Configure DATABASE_URL in your Render Backend Web Service Environment settings.'
  );
} else {
  const isLocalhost = /@(localhost|127\.0\.0\.1)(:|\/|$)/i.test(databaseUrl);
  if (process.env.NODE_ENV === 'production' && isLocalhost) {
    console.error(
      '❌ WARNING: DATABASE_URL points to localhost in production. ' +
        'Set DATABASE_URL to your hosted PostgreSQL connection string.'
    );
  }
  const maskedTarget = databaseUrl.replace(/^.*@([^/?]+).*$/, '$1');
  console.log(`🗄️ Prisma database target host: ${maskedTarget}`);
}

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

export default prisma;
