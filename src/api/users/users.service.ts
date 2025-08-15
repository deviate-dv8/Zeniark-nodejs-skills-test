import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/db/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private db: PrismaService) {}
  create() {
    return {
      message: 'Redirected to Google Auth',
    };
  }

  async findAll() {
    return this.db.user.findMany();
  }

  async findOne(id: string) {
    const user = await this.db.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User Not Found');
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);
    return this.db.user.update({
      where: {
        id: user.id,
      },
      data: updateUserDto,
    });
  }

  async remove(id: string) {
    const user = await this.findOne(id);
    await this.db.user.delete({ where: { id } });
    return user;
  }
}
