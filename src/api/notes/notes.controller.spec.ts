import { Test, TestingModule } from '@nestjs/testing';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';
import { JwtResponse } from '../authentication/passport-strategies/jwt/jwt.strategy';
import { PrismaModule } from 'src/db/prisma/prisma.module';
import { PrismaService } from 'src/db/prisma/prisma.service';
import { prismaServiceMock as db } from 'src/test/prisma.service.mock';

describe('NotesController', () => {
  let controller: NotesController;
  let service: NotesService;

  const mockNotesService = {
    create: jest.fn(),
    findAllByUser: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const user: JwtResponse = { id: '123', email: 'email@example.com' };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotesController],
      providers: [
        {
          provide: NotesService,
          useValue: mockNotesService,
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

    controller = module.get<NotesController>(NotesController);
    service = module.get<NotesService>(NotesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call NotesService.create with correct parameters', async () => {
      const createNoteDto = { title: 'Test Note', content: 'Test Content' };
      mockNotesService.create.mockResolvedValue({ id: '1', ...createNoteDto });

      const result = await controller.create(createNoteDto, { user });
      expect(service.create).toHaveBeenCalledWith(createNoteDto, user);
      expect(result).toEqual({ id: '1', ...createNoteDto });
    });
  });

  describe('findAllByUser', () => {
    it('should call NotesService.findAllByUser with correct parameters', async () => {
      const notes = [{ id: '1', title: 'Note 1' }];
      mockNotesService.findAllByUser.mockResolvedValue(notes);

      const result = await controller.findAllByUser({ user });
      expect(service.findAllByUser).toHaveBeenCalledWith(user);
      expect(result).toEqual(notes);
    });
  });

  describe('findOne', () => {
    it('should call NotesService.findOne with correct parameters', async () => {
      const id = '1';
      const note = { id: '1', title: 'Note 1' };
      mockNotesService.findOne.mockResolvedValue(note);

      const result = await controller.findOne(id, { user });
      expect(service.findOne).toHaveBeenCalledWith(id, user);
      expect(result).toEqual(note);
    });
  });

  describe('update', () => {
    it('should call NotesService.update with correct parameters', async () => {
      const id = '1';
      const updateNoteDto = {
        title: 'Updated Note',
        content: 'Updated Content',
      };
      const updatedNote = { id: '1', ...updateNoteDto };
      mockNotesService.update.mockResolvedValue(updatedNote);

      const result = await controller.update(id, updateNoteDto, { user });
      expect(service.update).toHaveBeenCalledWith(id, updateNoteDto, user);
      expect(result).toEqual(updatedNote);
    });
  });

  describe('remove', () => {
    it('should call NotesService.remove with correct parameters', async () => {
      const id = '1';
      mockNotesService.remove.mockResolvedValue({ id: '1' });

      const result = await controller.remove(id, { user });
      expect(service.remove).toHaveBeenCalledWith(id, user);
      expect(result).toEqual({ id: '1' });
    });
  });
});
