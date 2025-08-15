import { Test, TestingModule } from '@nestjs/testing';
import { TagsController } from './tags.controller';
import { TagsService } from './tags.service';
import { PrismaModule } from 'src/db/prisma/prisma.module';
import { PrismaService } from 'src/db/prisma/prisma.service';
import { prismaServiceMock as db } from 'src/test/prisma.service.mock';
import { RequestJwt } from 'src/utils/RequestJwt';

describe('TagsController', () => {
  let controller: TagsController;
  let service: TagsService;

  const mockTagsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findAllByUser: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const user = { id: '123', email: 'email@example.com' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TagsController],
      providers: [
        {
          provide: TagsService,
          useValue: mockTagsService,
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

    controller = module.get<TagsController>(TagsController);
    service = module.get<TagsService>(TagsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call TagsService.create with correct parameters', async () => {
      const createTagDto = { name: 'Test Tag' };
      mockTagsService.create.mockResolvedValue({ id: '1', ...createTagDto });

      const result = await controller.create(createTagDto, {
        user,
      } as RequestJwt);
      expect(service.create).toHaveBeenCalledWith(createTagDto, user);
      expect(result).toEqual({ id: '1', ...createTagDto });
    });
  });

  describe('findAll', () => {
    it('should call TagsService.findAll', async () => {
      const tags = [{ id: '1', name: 'Tag 1' }];
      mockTagsService.findAll.mockResolvedValue(tags);

      const result = await controller.findAll();
      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(tags);
    });
  });

  describe('findAllByUser', () => {
    it('should call TagsService.findAllByUser with correct parameters', async () => {
      const tags = [{ id: '1', name: 'Tag 1' }];
      mockTagsService.findAllByUser.mockResolvedValue(tags);

      const result = await controller.findAllByUser({ user } as RequestJwt);
      expect(service.findAllByUser).toHaveBeenCalledWith(user);
      expect(result).toEqual(tags);
    });
  });

  describe('findOne', () => {
    it('should call TagsService.findOne with correct parameters', async () => {
      const id = '1';
      const tag = { id: '1', name: 'Tag 1' };
      mockTagsService.findOne.mockResolvedValue(tag);

      const result = await controller.findOne(id, { user } as RequestJwt);
      expect(service.findOne).toHaveBeenCalledWith(id, user);
      expect(result).toEqual(tag);
    });
  });

  describe('update', () => {
    it('should call TagsService.update with correct parameters', async () => {
      const id = '1';
      const updateTagDto = { name: 'Updated Tag' };
      const updatedTag = { id: '1', ...updateTagDto };
      mockTagsService.update.mockResolvedValue(updatedTag);

      const result = await controller.update(id, updateTagDto, {
        user,
      } as RequestJwt);
      expect(service.update).toHaveBeenCalledWith(id, updateTagDto, user);
      expect(result).toEqual(updatedTag);
    });
  });

  describe('remove', () => {
    it('should call TagsService.remove with correct parameters', async () => {
      const id = '1';
      mockTagsService.remove.mockResolvedValue({ id: '1' });

      const result = await controller.remove(id, { user } as RequestJwt);
      expect(service.remove).toHaveBeenCalledWith(id, user);
      expect(result).toEqual({ id: '1' });
    });
  });
});
