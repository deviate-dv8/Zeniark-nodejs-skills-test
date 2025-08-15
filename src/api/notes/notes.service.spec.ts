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
    categoryId: '',
    tagIds: [],
  };
  const sampleDatas: Note[] = [
    {
      id: '1',
      title: 'Sample Note',
      content: 'This is a sample note content.',
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 'user-123',
      categoryId: '',
      tagIds: [],
    },
    {
      id: 'r',
      title: 'Sample Note',
      content: 'This is a sample note content.',
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 'user-124',
      categoryId: '',
      tagIds: [],
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
    db.note.findMany.mockResolvedValue(sampleDatas);
    const result = await service.findAll();
    expect(result).toEqual(sampleDatas);
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
      include: {
        category: true,
        tags: true,
      },
    });
    expect(result).toEqual(sampleData);
  });
  it('update() - update should update a note', async () => {
    db.note.findFirst.mockResolvedValue(sampleData);
    db.note.update.mockResolvedValue(sampleData);
    db.tag.findMany.mockResolvedValue([]);
    const result = await service.update(
      sampleData.id,
      {
        title: 'Updated Note',
        content: 'Updated content',
        tagIds: [],
        categoryId: '',
      },
      sampleJwtUser,
    );
    expect(db.note.update).toHaveBeenCalledWith({
      where: { id: sampleData.id },
      data: {
        title: 'Updated Note',
        content: 'Updated content',
        tagIds: [],
        categoryId: '',
      },
      include: { category: true, tags: true },
    });
    expect(result).toEqual(sampleData);
  });
  it('update() - update should add categoryId if provided', async () => {
    const updatedNote = { ...sampleData, categoryId: 'category-123' };
    const sampleCategory = {
      id: 'category-123',
      name: 'Sample Category',
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: sampleJwtUser.id,
    };

    db.note.findFirst.mockResolvedValue(sampleData);
    db.category.findUnique.mockResolvedValue(sampleCategory);
    db.note.update.mockResolvedValue(updatedNote);

    const result = await service.update(
      sampleData.id,
      {
        categoryId: 'category-123',
        tagIds: undefined,
        content: undefined,
        title: undefined,
      },
      sampleJwtUser,
    );

    expect(db.category.findUnique).toHaveBeenCalledWith({
      where: { id: 'category-123', userId: sampleJwtUser.id },
    });
    expect(db.note.update).toHaveBeenCalledWith({
      where: { id: sampleData.id },
      data: { categoryId: 'category-123' },
      include: { category: true, tags: true },
    });
    expect(result).toEqual(updatedNote);
  });

  it('update() - update should add tags if provided', async () => {
    const updatedNote = { ...sampleData, tagIds: ['tag-1', 'tag-2'] };
    const updatedNoteDto = {
      title: sampleData.title,
      content: sampleData.content,
      categoryId: sampleData.categoryId ?? undefined, // Convert null to undefined
      tagIds: ['tag-1', 'tag-2'],
    };
    const sampleTags = [
      {
        id: 'tag-1',
        name: 'Tag 1',
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: sampleJwtUser.id,
        noteIds: [sampleData.id],
      },
      {
        id: 'tag-2',
        name: 'Tag 2',
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: sampleJwtUser.id,
        noteIds: [sampleData.id],
      },
    ];

    db.note.findFirst.mockResolvedValue(sampleData);
    db.tag.findMany.mockResolvedValue(sampleTags);
    db.note.update.mockResolvedValue(updatedNote);

    const result = await service.update(
      sampleData.id,
      updatedNoteDto,
      sampleJwtUser,
    );

    expect(db.tag.findMany).toHaveBeenCalledWith({
      where: {
        id: { in: ['tag-1', 'tag-2'] },
        userId: sampleJwtUser.id,
      },
    });
    expect(db.note.update).toHaveBeenCalledWith({
      where: { id: sampleData.id },
      data: updatedNoteDto,
      include: { category: true, tags: true },
    });
    expect(result).toEqual(updatedNote);
  });
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
