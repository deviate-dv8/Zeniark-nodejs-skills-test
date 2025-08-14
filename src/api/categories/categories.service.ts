import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/db/prisma/prisma.service';
import { JwtResponse } from '../authentication/passport-strategies/jwt/jwt.strategy';

@Injectable()
export class CategoriesService {
  constructor(private db: PrismaService) {}
  async create(createCategoryDto: CreateCategoryDto, user: JwtResponse) {
    return this.db.category.create({
      data: {
        ...createCategoryDto,
        userId: user.id,
      },
    });
  }
  async findAllByUser(user: JwtResponse) {
    return this.db.category.findMany({
      where: {
        userId: user.id,
      },
    });
  }
  async findAll() {
    return this.db.category.findMany();
  }

  async findOne(id: string, user: JwtResponse) {
    const userInfo = await this.db.user.findUnique({ where: { id: user.id } }); // Updated this so it guarantees check for user.role
    if (!userInfo) {
      throw new NotFoundException('User Not Found');
    }
    const category = await this.db.category.findFirst({
      where: {
        id,
        ...(userInfo.role == 'ADMIN' ? null : { userId: user.id }),
      },
      include: {
        notes: true,
      },
    });
    if (!category) {
      throw new NotFoundException('Category Not Found');
    }
    return category;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    user: JwtResponse,
  ) {
    const category = await this.findOne(id, user);
    return this.db.category.update({
      where: {
        id: category.id,
      },
      data: updateCategoryDto,
    });
  }

  async remove(id: string, user: JwtResponse) {
    const category = await this.findOne(id, user);
    await this.db.category.delete({
      where: {
        id: category.id,
      },
    });
    return category;
  }
}
