import { Test, TestingModule } from '@nestjs/testing';
import { TagsService } from './tags.service';
import { PrismaService } from 'src/db/prisma/prisma.service';
import { prismaServiceMock as db } from 'src/test/prisma.service.mock';
import { Tag, User } from '@prisma/client';
import { JwtResponse } from '../authentication/passport-strategies/jwt/jwt.strategy';
import { NotFoundException } from '@nestjs/common';

describe('TagsService', () => {
  let service: TagsService;

  const sampleTag: Tag = {
    id: 'tag-1',
    name: 'Sample Tag',
    userId: 'user-123',
    noteIds: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const sampleTags: Tag[] = [
    {
      id: 'tag-1',
      name: 'Sample Tag',
      userId: 'user-123',
      noteIds: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'tag-2',
      name: 'Another Tag',
      userId: 'user-124',
      noteIds: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const sampleJwtUser: JwtResponse = {
    id: 'user-123',
    email: 'user@example.com',
  };

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
      providers: [TagsService, { provide: PrismaService, useValue: db }],
    }).compile();

    service = module.get<TagsService>(TagsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create() - should create a tag', async () => {
    db.tag.create.mockResolvedValue(sampleTag);
    const result = await service.create(
      { name: sampleTag.name },
      sampleJwtUser,
    );
    expect(result).toEqual(sampleTag);
    expect(db.tag.create).toHaveBeenCalledWith({
      data: { name: sampleTag.name, userId: sampleJwtUser.id },
    });
  });

  it('findAll() - should return all tags', async () => {
    db.tag.findMany.mockResolvedValue(sampleTags);
    const result = await service.findAll();
    expect(result).toEqual(sampleTags);
  });

  it('findAllByUser() - should return all tags for a user', async () => {
    db.tag.findMany.mockResolvedValue([sampleTag]);
    const result = await service.findAllByUser(sampleJwtUser);
    expect(result).toEqual([sampleTag]);
    expect(db.tag.findMany).toHaveBeenCalledWith({
      where: { userId: sampleJwtUser.id },
    });
  });

  it('findOne() - should return a tag by ID', async () => {
    db.user.findUnique.mockResolvedValue(sampleUser);
    db.tag.findFirst.mockResolvedValue(sampleTag);

    const result = await service.findOne(sampleTag.id, sampleJwtUser);
    expect(result).toEqual(sampleTag);
    expect(db.tag.findFirst).toHaveBeenCalledWith({
      where: { id: sampleTag.id, userId: sampleJwtUser.id },
    });
  });

  it('findOne() - should throw NotFoundException if tag is not found', async () => {
    db.user.findUnique.mockResolvedValue(sampleUser);
    db.tag.findFirst.mockResolvedValue(null);

    await expect(
      service.findOne('non-existent-id', sampleJwtUser),
    ).rejects.toThrow(NotFoundException);
  });

  it('update() - should update a tag', async () => {
    const updatedTag = { ...sampleTag, name: 'Updated Tag' };
    db.user.findUnique.mockResolvedValue(sampleUser);
    db.tag.findFirst.mockResolvedValue(sampleTag);
    db.tag.update.mockResolvedValue(updatedTag);

    const result = await service.update(
      sampleTag.id,
      { name: 'Updated Tag' },
      sampleJwtUser,
    );
    expect(result).toEqual(updatedTag);
    expect(db.tag.update).toHaveBeenCalledWith({
      where: { id: sampleTag.id },
      omit: { noteIds: true },
      data: { name: 'Updated Tag' },
    });
  });

  it('remove() - should delete a tag', async () => {
    db.user.findUnique.mockResolvedValue(sampleUser);
    db.tag.findFirst.mockResolvedValue(sampleTag);
    db.tag.delete.mockResolvedValue(sampleTag);

    const result = await service.remove(sampleTag.id, sampleJwtUser);
    expect(result).toEqual(sampleTag);
    expect(db.tag.delete).toHaveBeenCalledWith({
      where: { id: sampleTag.id },
    });
  });

  it('remove() - should throw NotFoundException if tag is not found', async () => {
    db.user.findUnique.mockResolvedValue(sampleUser);
    db.tag.findFirst.mockResolvedValue(null);

    await expect(
      service.remove('non-existent-id', sampleJwtUser),
    ).rejects.toThrow(NotFoundException);
  });
});
