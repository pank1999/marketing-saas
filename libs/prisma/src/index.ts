import { PrismaClient } from '@prisma/client';
import { testConnection } from './prisma';

const prisma = new PrismaClient();

export default { prisma, testConnection };
