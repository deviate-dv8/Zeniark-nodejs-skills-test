import { PrismaService } from 'src/db/prisma/prisma.service';

import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

export type MockPrismaService = DeepMockProxy<PrismaService>;
export const prismaServiceMock = mockDeep<PrismaService>();
