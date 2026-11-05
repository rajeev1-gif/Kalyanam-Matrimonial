const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env'), override: true });
const { PrismaClient } = require('@prisma/client');

const dbUrl = (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('5432'))
  ? process.env.DATABASE_URL
  : 'postgresql://postgres@127.0.0.1:5432/matrimonial_db?schema=public';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: dbUrl,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

module.exports = prisma;
  