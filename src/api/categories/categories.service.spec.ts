import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { PrismaModule } from 'src/db/prisma/prisma.module';
import { PrismaService } from 'src/db/prisma/prisma.service';
import { prismaServiceMock as db } from 'src/test/prisma.service.mock';
import { Category, User } from '@prisma/client';
import { JwtResponse } from '../authentication/passport-strategies/jwt/jwt.strategy';

describe('CategoriesService', () => {
  let service: CategoriesService;

  const sampleCategory: Category = {
    id: 'category-123',
    name: 'Sample Category',
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: 'user-123',
  };

  const sampleCategories: Category[] = [
    {
      id: 'category-123',
      name: 'Sample Category',
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 'user-123',
    },
    {
      id: 'category-456',
      name: 'Another Category',
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 'user-124',
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
      providers: [CategoriesService],
      imports: [
        {
          module: PrismaModule,
          providers: [{ provide: PrismaService, useValue: db }],
          exports: [PrismaService],
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create() - should create a category', async () => {
    db.category.create.mockResolvedValue(sampleCategory);
    const result = await service.create(
      { name: sampleCategory.name },
      sampleJwtUser,
    );
    expect(db.category.create).toHaveBeenCalledWith({
      data: {
        name: sampleCategory.name,
        userId: sampleJwtUser.id,
      },
    });
    expect(result).toEqual(sampleCategory);
  });

  it('findAll() - should return all categories', async () => {
    db.category.findMany.mockResolvedValue(sampleCategories);
    const result = await service.findAll();
    expect(result).toEqual(sampleCategories);
  });

  it('findAllByUser() - should return all categories for a user', async () => {
    db.category.findMany.mockResolvedValue([sampleCategory]);
    const result = await service.findAllByUser(sampleJwtUser);
    expect(db.category.findMany).toHaveBeenCalledWith({
      where: { userId: sampleJwtUser.id },
    });
    expect(result).toEqual([sampleCategory]);
  });

  it('findOne() - should return a category by ID', async () => {
    db.user.findUnique.mockResolvedValue(sampleUser);
    db.category.findFirst.mockResolvedValue(sampleCategory);

    const result = await service.findOne(sampleCategory.id, sampleJwtUser);
    expect(db.category.findFirst).toHaveBeenCalledWith({
      where: {
        id: sampleCategory.id,
        userId: sampleJwtUser.id,
      },
      include: { notes: true },
    });
    expect(result).toEqual(sampleCategory);
  });

  it('update() - should update a category', async () => {
    db.category.findFirst.mockResolvedValue(sampleCategory);
    db.category.update.mockResolvedValue(sampleCategory);

    const result = await service.update(
      sampleCategory.id,
      { name: 'Updated Category' },
      sampleJwtUser,
    );
    expect(db.category.update).toHaveBeenCalledWith({
      where: { id: sampleCategory.id },
      data: { name: 'Updated Category' },
    });
    expect(result).toEqual(sampleCategory);
  });

  it('remove() - should delete a category', async () => {
    db.category.findFirst.mockResolvedValue(sampleCategory);
    db.category.delete.mockResolvedValue(sampleCategory);

    const result = await service.remove(sampleCategory.id, sampleJwtUser);
    expect(db.category.delete).toHaveBeenCalledWith({
      where: { id: sampleCategory.id },
    });
    expect(result).toEqual(sampleCategory);
  });
});
