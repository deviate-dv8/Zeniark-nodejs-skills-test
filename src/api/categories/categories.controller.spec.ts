import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { PrismaModule } from 'src/db/prisma/prisma.module';
import { PrismaService } from 'src/db/prisma/prisma.service';
import { prismaServiceMock as db } from 'src/test/prisma.service.mock';
import { RequestJwt } from 'src/utils/RequestJwt';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let service: CategoriesService;

  const mockCategoriesService = {
    create: jest.fn(),
    findAllByUser: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const user = { id: '123', email: 'email@example.com' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: mockCategoriesService,
        },
      ],
      imports: [
        {
          module: PrismaModule,
          providers: [{ provide: PrismaService, useValue: db }],
          exports: [PrismaService],
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
    service = module.get<CategoriesService>(CategoriesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call CategoriesService.create with correct parameters', async () => {
      const createCategoryDto = { name: 'Test Category' };
      mockCategoriesService.create.mockResolvedValue({
        id: '1',
        ...createCategoryDto,
      });

      const result = await controller.create(createCategoryDto, {
        user,
      } as RequestJwt);
      expect(service.create).toHaveBeenCalledWith(createCategoryDto, user);
      expect(result).toEqual({ id: '1', ...createCategoryDto });
    });
  });

  describe('findAllByUser', () => {
    it('should call CategoriesService.findAllByUser with correct parameters', async () => {
      const categories = [{ id: '1', name: 'Category 1' }];
      mockCategoriesService.findAllByUser.mockResolvedValue(categories);

      const result = await controller.findallByUser({ user } as RequestJwt);
      expect(service.findAllByUser).toHaveBeenCalledWith(user);
      expect(result).toEqual(categories);
    });
  });

  describe('findAll', () => {
    it('should call CategoriesService.findAll', async () => {
      const categories = [{ id: '1', name: 'Category 1' }];
      mockCategoriesService.findAll.mockResolvedValue(categories);

      const result = await controller.findAll();
      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(categories);
    });
  });

  describe('findOne', () => {
    it('should call CategoriesService.findOne with correct parameters', async () => {
      const id = '1';
      const category = { id: '1', name: 'Category 1' };
      mockCategoriesService.findOne.mockResolvedValue(category);

      const result = await controller.findOne(id, { user } as RequestJwt);
      expect(service.findOne).toHaveBeenCalledWith(id, user);
      expect(result).toEqual(category);
    });
  });

  describe('update', () => {
    it('should call CategoriesService.update with correct parameters', async () => {
      const id = '1';
      const updateCategoryDto = { name: 'Updated Category' };
      const updatedCategory = { id: '1', ...updateCategoryDto };
      mockCategoriesService.update.mockResolvedValue(updatedCategory);

      const result = await controller.update(id, updateCategoryDto, {
        user,
      } as RequestJwt);
      expect(service.update).toHaveBeenCalledWith(id, updateCategoryDto, user);
      expect(result).toEqual(updatedCategory);
    });
  });

  describe('remove', () => {
    it('should call CategoriesService.remove with correct parameters', async () => {
      const id = '1';
      mockCategoriesService.remove.mockResolvedValue({ id: '1' });

      const result = await controller.remove(id, { user } as RequestJwt);
      expect(service.remove).toHaveBeenCalledWith(id, user);
      expect(result).toEqual({ id: '1' });
    });
  });
});
