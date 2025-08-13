import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './db/prisma/prisma.module';
import { AuthModule } from './api/authentication/auth/auth.module';
import { NotesModule } from './api/notes/notes.module';

@Module({
  imports: [PrismaModule, AuthModule, NotesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
