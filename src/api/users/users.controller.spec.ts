import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaModule } from 'src/db/prisma/prisma.module';
import { PrismaService } from 'src/db/prisma/prisma.service';
import { prismaServiceMock as db } from 'src/test/prisma.service.mock';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
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

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call UsersService.create', async () => {
      const mockResponse = { id: '1', name: 'Test User' };
      mockUsersService.create.mockResolvedValue(mockResponse);

      // eslint-disable-next-line
      const result = await controller.create();
      expect(service.create).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });
  });

  describe('findAll', () => {
    it('should call UsersService.findAll', async () => {
      const mockUsers = [{ id: '1', email: 'test@example.com' }];
      mockUsersService.findAll.mockResolvedValue(mockUsers);

      const result = await controller.findAll();
      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });
  });

  describe('findOne', () => {
    it('should call UsersService.findOne with correct parameters', async () => {
      const id = '1';
      const mockUser = { id: '1', email: 'test@example.com' };
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await controller.findOne(id);
      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockUser);
    });
  });

  describe('update', () => {
    it('should call UsersService.update with correct parameters', async () => {
      const id = '1';
      const updateUserDto = { name: 'Updated Name' };
      const updatedUser = { id: '1', ...updateUserDto };
      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.update(id, updateUserDto);
      expect(service.update).toHaveBeenCalledWith(id, updateUserDto);
      expect(result).toEqual(updatedUser);
    });
  });

  describe('remove', () => {
    it('should call UsersService.remove with correct parameters', async () => {
      const id = '1';
      mockUsersService.remove.mockResolvedValue({ id: '1' });

      const result = await controller.remove(id);
      expect(service.remove).toHaveBeenCalledWith(id);
      expect(result).toEqual({ id: '1' });
    });
  });
});
