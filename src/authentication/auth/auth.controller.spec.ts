import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from '../../db/prisma/prisma.module';
import { JwtStrategy } from '../passport-strategies/jwt/jwt.strategy';
import { GoogleOAuth2Strategy } from '../passport-strategies/google-oauth2/googleoauth2.strategy';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
