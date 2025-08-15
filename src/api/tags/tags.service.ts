import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { PrismaService } from 'src/db/prisma/prisma.service';
import { JwtResponse } from '../authentication/passport-strategies/jwt/jwt.strategy';

@Injectable()
export class TagsService {
  constructor(private db: PrismaService) {}
  async create(createTagDto: CreateTagDto, user: JwtResponse) {
    return this.db.tag.create({
      data: {
        ...createTagDto,
        userId: user.id,
      },
    });
  }
  async findAllByUser(user: JwtResponse) {
    return this.db.tag.findMany({
      where: {
        userId: user.id,
      },
    });
  }
  async findAll() {
    return this.db.tag.findMany({});
  }

  async findOne(id: string, user: JwtResponse) {
    const userInfo = await this.db.user.findUnique({ where: { id: user.id } }); // Updated this so it guarantees check for user.role
    if (!userInfo) {
      throw new NotFoundException('User Not Found');
    }
    const tag = await this.db.tag.findFirst({
      where: {
        id,
        ...(userInfo.role == 'ADMIN' ? null : { userId: user.id }),
      },
    });
    if (!tag) {
      throw new NotFoundException('Tag Not Found');
    }
    return tag;
  }

  async update(id: string, updateTagDto: UpdateTagDto, user: JwtResponse) {
    const tag = await this.findOne(id, user);
    return this.db.tag.update({
      where: {
        id: tag.id,
      },
      omit: {
        noteIds: true, // The Many to Many relation in Prisma+MongoDB is a bit tricky to work so I omit it and only do the checking of relation in the notes model
      },
      data: updateTagDto,
    });
  }

  async remove(id: string, user: JwtResponse) {
    const tag = await this.findOne(id, user);
    if (!tag) {
      throw new NotFoundException('Tag Not Found');
    }
    return this.db.tag.delete({
      where: {
        id: tag.id,
      },
    });
  }
}
