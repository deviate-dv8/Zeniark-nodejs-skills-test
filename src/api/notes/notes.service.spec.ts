import { Test, TestingModule } from '@nestjs/testing';
import { NotesService } from './notes.service';
import { PrismaModule } from 'src/db/prisma/prisma.module';
import { PrismaService } from 'src/db/prisma/prisma.service';
import { prismaServiceMock as db } from 'src/test/prisma.service.mock';
import { Note, User } from '@prisma/client';
import { JwtResponse } from '../authentication/passport-strategies/jwt/jwt.strategy';

describe('NotesService', () => {
  let service: NotesService;

  const sampleData: Note = {
    id: '1',
    title: 'Sample Note',
    content: 'This is a sample note content.',
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: 'user-123',
    categoryId: null,
  };
  const sampleDatas: Note[] = [
    {
      id: '1',
      title: 'Sample Note',
      content: 'This is a sample note content.',
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 'user-123',
      categoryId: null,
    },
    {
      id: 'r',
      title: 'Sample Note',
      content: 'This is a sample note content.',
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 'user-124',
      categoryId: null,
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
      providers: [NotesService],
      imports: [
        {
          module: PrismaModule,
          providers: [{ provide: PrismaService, useValue: db }],
          exports: [PrismaService],
        },
      ],
    }).compile();

    service = module.get<NotesService>(NotesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('create() - create should create a note', async () => {
    db.note.create.mockResolvedValue(sampleData);
    const result = await service.create(
      {
        title: sampleData.title,
        content: sampleData.content,
      },
      sampleJwtUser,
    );
    expect(result).toEqual(sampleData);
  });
  it('findAll() - findAll should return all notes', async () => {
    db.note.findMany.mockResolvedValue([sampleData]);
    const result = await service.findAll();
    expect(result).toEqual([sampleData]);
  });
  it('findAllByUser() - findAllByUser should return all notes based on user', async () => {
    db.note.findMany.mockResolvedValue([sampleData]);
    const result = await service.findAllByUser(sampleJwtUser);
    expect(db.note.findMany).toHaveBeenCalledWith({
      where: { userId: sampleJwtUser.id },
    });
    expect(result).toEqual([sampleData]);
  });
  it('findOne() - findOne should return a note by ID)', async () => {
    db.note.findFirst.mockResolvedValue(sampleData);
    db.user.findUnique.mockResolvedValue(sampleUser);

    const result = await service.findOne(sampleData.id, sampleJwtUser);
    expect(db.note.findFirst).toHaveBeenCalledWith({
      where: { id: sampleData.id, userId: sampleJwtUser.id },
    });
    expect(result).toEqual(sampleData);
  });
  it('update() - update should update a note', async () => {
    db.note.findFirst.mockResolvedValue(sampleData);
    db.note.update.mockResolvedValue(sampleData);
    const result = await service.update(
      sampleData.id,
      { title: 'Updated Note', content: 'Updated content' },
      sampleJwtUser,
    );
    expect(db.note.update).toHaveBeenCalledWith({
      where: { id: sampleData.id },
      data: { title: 'Updated Note', content: 'Updated content' },
    });
    expect(result).toEqual(sampleData);
  });
  it('update() - update should add categoryId if provided', async () => {});
  it('update() - update should add tags if provided', async () => {});
  it('remove() - remove should delete a note', async () => {
    db.note.findFirst.mockResolvedValue(sampleData);
    db.note.delete.mockResolvedValue(sampleData);
    const result = await service.remove(sampleData.id, sampleJwtUser);
    expect(db.note.delete).toHaveBeenCalledWith({
      where: { id: sampleData.id },
    });
    expect(result).toEqual(sampleData);
  });
});
