import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { JwtResponse } from '../authentication/passport-strategies/jwt/jwt.strategy';
import { PrismaService } from 'src/db/prisma/prisma.service';

@Injectable()
export class NotesService {
  constructor(private db: PrismaService) {}
  async create(createNoteDto: CreateNoteDto, user: JwtResponse) {
    if (createNoteDto.categoryId) {
      const category = await this.db.category.findUnique({
        where: { id: createNoteDto.categoryId, userId: user.id },
      });
      if (!category) {
        throw new NotFoundException('Category Not Found');
      }
    }
    return this.db.note.create({
      data: {
        ...createNoteDto,
        userId: user.id,
      },
    });
  }

  async findAllByUser(user: JwtResponse) {
    return this.db.note.findMany({
      where: {
        userId: user.id,
      },
    });
  }
  async findAll() {
    return this.db.note.findMany();
  }

  async findOne(id: string, user: JwtResponse) {
    const userInfo = await this.db.user.findUnique({ where: { id: user.id } }); // Updated this so it guarantees check for user.role
    if (!userInfo) {
      throw new NotFoundException('User Not Found');
    }
    const note = await this.db.note.findFirst({
      where: {
        id,
        ...(userInfo.role == 'ADMIN' ? null : { userId: user.id }),
      },
    });
    if (!note) {
      throw new NotFoundException('Note Not Found');
    }
    return note;
  }

  async update(id: string, updateNoteDto: UpdateNoteDto, user: JwtResponse) {
    const note = await this.findOne(id, user);
    if (updateNoteDto.categoryId) {
      const category = await this.db.category.findUnique({
        where: { id: updateNoteDto.categoryId, userId: user.id },
      });
      if (!category) {
        throw new NotFoundException('Category Not Found');
      }
    }
    return this.db.note.update({
      where: {
        id: note.id,
      },
      data: updateNoteDto,
      include: {
        category: true,
        tags: true,
      },
    });
  }

  async remove(id: string, user: JwtResponse) {
    const note = await this.findOne(id, user);
    await this.db.note.delete({
      where: {
        id: note.id,
      },
    });
    return note;
  }
}
