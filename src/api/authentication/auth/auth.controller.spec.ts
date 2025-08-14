import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from '../../../db/prisma/prisma.module';
import { JwtStrategy } from '../passport-strategies/jwt/jwt.strategy';
import {
  GoogleOAuth20Response,
  GoogleOAuth2Strategy,
} from '../passport-strategies/google-oauth2/googleoauth2.strategy';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { User } from '@prisma/client';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const decodedTokenStub = {
    id: '689b9c4d7851c686e75dca4a',
    email: 'example@email.com',
    role: 'USER',
  };

  const googleUserStub: {
    access_token: string;
    userInfo: User;
  } = {
    access_token: 'mockAccessToken',
    userInfo: {
      id: '12345',
      email: 'googleuser@email.com',
      name: 'Google User',
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };
  const googleUserRequestStub: GoogleOAuth20Response = {
    email: 'googleuser@email.com',
    refreshToken: 'abcd',
    lastName: 'User',
    firstName: 'Google',
    accessToken: 'efgh',
    picture: 'https://example.com/picture.jpg',
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService, JwtStrategy, GoogleOAuth2Strategy],
      imports: [
        PrismaModule,
        JwtModule.register({
          secret: process.env.JWT_SECRET || 'thequickbrownfox',
          signOptions: { expiresIn: '7d' },
        }),
        PassportModule,
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('/me', () => {
    it('should return user info when authenticated', () => {
      const result = controller.me({ user: decodedTokenStub });
      expect(result).toEqual(decodedTokenStub);
    });
  });

  describe('/google', () => {
    it('should define googleAuth method', () => {
      expect(controller.googleAuth).toBeDefined();
    });
  });

  describe('/google/callback', () => {
    it('should return access token and user info on successful Google sign-in', async () => {
      jest
        .spyOn(authService, 'googleSignIn')
        .mockResolvedValueOnce(googleUserStub);

      const result = await controller.googleAuthRedirect({
        user: googleUserRequestStub,
      });

      expect(result).toEqual({
        access_token: googleUserStub.access_token,
        user: googleUserStub.userInfo,
      });
      expect(authService.googleSignIn).toHaveBeenCalledWith(
        googleUserRequestStub,
      );
    });
  });
});
