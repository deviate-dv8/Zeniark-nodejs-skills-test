import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './db/prisma/prisma.module';
import { AuthModule } from './api/authentication/auth/auth.module';
import { NotesModule } from './api/notes/notes.module';
import { CategoriesModule } from './api/categories/categories.module';
import { TagsModule } from './api/tags/tags.module';
import { UsersModule } from './api/users/users.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    NotesModule,
    CategoriesModule,
    TagsModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
