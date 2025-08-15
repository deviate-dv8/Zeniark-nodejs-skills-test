import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaModule } from 'src/db/prisma/prisma.module';
import { PrismaService } from 'src/db/prisma/prisma.service';
import { prismaServiceMock as db } from 'src/test/prisma.service.mock';
import { User } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;

  const sampleUser: User = {
    id: 'user-123',
    email: 'user@example.com',
    name: 'Test User',
    role: 'USER',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
      imports: [
        {
          module: PrismaModule,
          providers: [{ provide: PrismaService, useValue: db }],
          exports: [PrismaService],
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create() - should return a redirect message', () => {
    const result = service.create();
    expect(result).toEqual({ message: 'Redirected to Google Auth' });
  });

  it('findAll() - should return all users', async () => {
    db.user.findMany.mockResolvedValue([sampleUser]);
    const result = await service.findAll();
    expect(result).toEqual([sampleUser]);
  });

  it('findOne() - should return a user by ID', async () => {
    db.user.findUnique.mockResolvedValue(sampleUser);
    const result = await service.findOne(sampleUser.id);
    expect(db.user.findUnique).toHaveBeenCalledWith({
      where: { id: sampleUser.id },
    });
    expect(result).toEqual(sampleUser);
  });

  it('findOne() - should throw NotFoundException if user is not found', async () => {
    db.user.findUnique.mockResolvedValue(null);
    await expect(service.findOne('non-existent-id')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('update() - should update a user', async () => {
    const updateUserDto = { name: 'Updated Name' };
    const updatedUser = { ...sampleUser, ...updateUserDto };

    db.user.findUnique.mockResolvedValue(sampleUser);
    db.user.update.mockResolvedValue(updatedUser);

    const result = await service.update(sampleUser.id, updateUserDto);
    expect(db.user.update).toHaveBeenCalledWith({
      where: { id: sampleUser.id },
      data: updateUserDto,
    });
    expect(result).toEqual(updatedUser);
  });

  it('remove() - should delete a user', async () => {
    db.user.findUnique.mockResolvedValue(sampleUser);
    db.user.delete.mockResolvedValue(sampleUser);

    const result = await service.remove(sampleUser.id);
    expect(db.user.delete).toHaveBeenCalledWith({
      where: { id: sampleUser.id },
    });
    expect(result).toEqual(sampleUser);
  });
});
