import path from 'path';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config({ path: path.join(__dirname, '../../.env'), override: true });

const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:pass@123@localhost:5432/matrimonial_db?schema=public';

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: dbUrl,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

export default prisma;
