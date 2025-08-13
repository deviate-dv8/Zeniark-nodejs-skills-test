import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../../db/prisma/prisma.service';
import { GoogleOAuth20Response } from '../passport-strategies/google-oauth2/googleoauth2.strategy';

@Injectable()
export class AuthService {
  constructor(
    private db: PrismaService,
    private jwtService: JwtService,
  ) {}
  async googleSignIn(user: GoogleOAuth20Response) {
    const userInfo = await this.db.user.findUnique({
      where: {
        email: user.email,
      },
    });
    if (userInfo) {
      const jwtToken = this.jwtService.sign(
        {
          sub: userInfo.id,
          email: userInfo.email,
          role: userInfo.role,
        },

        {
          issuer: 'NoteApp',
          audience: 'NoteApp',
        },
      );
      return {
        access_token: jwtToken,
        userInfo,
      };
    }
    // Creates New User
    const newUser = await this.db.user.create({
      data: {
        email: user.email,
        name: user.firstName + ' ' + user.lastName,
      },
    });
    const jwtToken = this.jwtService.sign(
      {
        sub: newUser.id,
        email: newUser.email,
        role: newUser.role,
      },
      {
        issuer: 'NoteApp',
        audience: 'NoteApp',
      },
    );
    return {
      access_token: jwtToken,
      userInfo: newUser,
    };
  }
}
