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
    if (createNoteDto.tagIds) {
      console.log(createNoteDto.tagIds);
      const tags = await this.db.tag.findMany({
        where: {
          id: {
            in: createNoteDto.tagIds,
          },
          userId: user.id,
        },
      });
      if (tags.length !== createNoteDto.tagIds.length) {
        throw new NotFoundException('One or more Tags Not Found');
      }
    }
    const note = await this.db.note.create({
      data: {
        ...createNoteDto,
        userId: user.id,
      },
    });

    return note;
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
      include: {
        category: true,
        tags: true,
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
    if (updateNoteDto.tagIds) {
      const tags = await this.db.tag.findMany({
        where: {
          id: {
            in: updateNoteDto.tagIds,
          },
          userId: user.id,
        },
      });
      if (tags.length !== updateNoteDto.tagIds.length) {
        throw new NotFoundException('One or more Tags Not Found');
      }
    }
    const newNote = await this.db.note.update({
      where: {
        id: note.id,
      },
      data: updateNoteDto,
      include: {
        category: true,
        tags: true,
      },
    });
    return newNote;
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
