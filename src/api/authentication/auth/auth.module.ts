import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from 'src/db/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '../passport-strategies/jwt/jwt.strategy';
import { GoogleOAuth2Strategy } from '../passport-strategies/google-oauth2/googleoauth2.strategy';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, GoogleOAuth2Strategy],
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'thequickbrownfox', // Use only 'secret'
      signOptions: { expiresIn: '7d' }, // Token expiration time
    }),
    PassportModule,
  ],
})
export class AuthModule {}
