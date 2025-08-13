import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from '../passport-strategies/jwt/jwt.strategy';
import {
  GoogleOAuth20Response,
  GoogleOAuth2Strategy,
} from '../passport-strategies/google-oauth2/googleoauth2.strategy';
import { PrismaModule } from '../../../db/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from '../../../db/prisma/prisma.service';
import {
  MockPrismaService,
  prismaServiceMock,
} from '../../../test/prisma.service.mock';

describe('AuthService', () => {
  let service: AuthService;
  let db: MockPrismaService;
  const googleOAuth2ResponseStub: GoogleOAuth20Response = {
    email: 'example@email.com',
    accessToken: '1234567890',
    refreshToken: '0987654321',
    firstName: 'John',
    lastName: 'Doe',
    picture: 'http://example.com/picture.jpg',
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService, JwtStrategy, GoogleOAuth2Strategy],
      imports: [
        {
          module: PrismaModule,
          providers: [{ provide: PrismaService, useValue: prismaServiceMock }],
          exports: [PrismaService],
        },
        JwtModule.register({
          secret: process.env.JWT_SECRET || 'thequickbrownfox', // Use only 'secret'
          signOptions: { expiresIn: '7d' }, // Token expiration time
        }),
        PassportModule,
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    db = module.get<MockPrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('should return user info and access token on googleSignIn if user already exists', async () => {
    db.user.findUnique.mockResolvedValue({
      id: '1',
      email: googleOAuth2ResponseStub.email,
      name: `${googleOAuth2ResponseStub.firstName} ${googleOAuth2ResponseStub.lastName}`,
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await service.googleSignIn(googleOAuth2ResponseStub);

    expect(db.user.create).not.toHaveBeenCalled();
    expect(result).toHaveProperty('access_token');
    expect(result).toHaveProperty('userInfo');
    expect(result.userInfo.id).toBe('1'); // Existing user ID
    expect(result.userInfo.email).toBe(googleOAuth2ResponseStub.email);
  });

  it('should create a new user and return user info and access token on googleSignIn if user does not exist', async () => {
    db.user.findUnique.mockResolvedValue(null);
    db.user.create.mockResolvedValue({
      id: '2',
      email: googleOAuth2ResponseStub.email,
      name: `${googleOAuth2ResponseStub.firstName} ${googleOAuth2ResponseStub.lastName}`,
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await service.googleSignIn(googleOAuth2ResponseStub);
    expect(db.user.create).toHaveBeenCalledWith({
      data: {
        email: googleOAuth2ResponseStub.email,
        name: `${googleOAuth2ResponseStub.firstName} ${googleOAuth2ResponseStub.lastName}`,
      },
    });
    expect(result).toHaveProperty('access_token');
    expect(result).toHaveProperty('userInfo');
    expect(result.userInfo.email).toBe(googleOAuth2ResponseStub.email);
    expect(result.userInfo.id).toBe('2'); // New user ID, assuming
  });
});
