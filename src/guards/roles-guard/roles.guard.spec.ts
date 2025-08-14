import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { RolesGuard } from './roles.guard';
import { PrismaService } from 'src/db/prisma/prisma.service';
import { $Enums } from '@prisma/client';

describe('RolesGuard', () => {
  let rolesGuard: RolesGuard;
  let reflector: Reflector;
  let prismaService: PrismaService;

  beforeEach(() => {
    reflector = new Reflector();
    prismaService = {
      user: {
        findUnique: jest.fn(),
      },
    } as unknown as PrismaService;

    rolesGuard = new RolesGuard(reflector, prismaService);
  });

  it('should return true if no roles are defined', async () => {
    jest.spyOn(reflector, 'get').mockReturnValue(undefined);

    const mockContext = {
      getHandler: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ user: { id: 1 } }),
      }),
    } as unknown as ExecutionContext;

    const result = await rolesGuard.canActivate(mockContext);
    expect(result).toBe(true);
  });

  it('should return false if no user is found', async () => {
    jest.spyOn(reflector, 'get').mockReturnValue([$Enums.Role.ADMIN]);
    jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

    const mockContext = {
      getHandler: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ user: { id: 1 } }),
      }),
    } as unknown as ExecutionContext;

    const result = await rolesGuard.canActivate(mockContext);
    expect(result).toBe(false);
  });

  it('should return true if user has the required role', async () => {
    jest.spyOn(reflector, 'get').mockReturnValue([$Enums.Role.ADMIN]);
    jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue({
      id: 'abcd',
      email: 'user@example.com',
      name: 'Test User',
      createdAt: new Date(),
      updatedAt: new Date(),
      role: $Enums.Role.ADMIN,
    });

    const mockContext = {
      getHandler: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ user: { id: 1 } }),
      }),
    } as unknown as ExecutionContext;

    const result = await rolesGuard.canActivate(mockContext);
    expect(result).toBe(true);
  });

  it('should return false if user does not have the required role', async () => {
    jest.spyOn(reflector, 'get').mockReturnValue([$Enums.Role.ADMIN]);
    jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue({
      id: 'abcd',
      email: 'user@example.com',
      name: 'Test User',
      createdAt: new Date(),
      updatedAt: new Date(),
      role: $Enums.Role.USER,
    });

    const mockContext = {
      getHandler: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ user: { id: 1 } }),
      }),
    } as unknown as ExecutionContext;

    const result = await rolesGuard.canActivate(mockContext);
    expect(result).toBe(false);
  });
});
