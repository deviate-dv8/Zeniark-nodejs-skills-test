import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../passport-strategies/jwt/jwt.auth.guard';
import { JwtResponse } from '../passport-strategies/jwt/jwt.strategy';
import { GoogleOAuth2Guard } from '../passport-strategies/google-oauth2/googleoauth2.guard';
import { GoogleOAuth20Response } from '../passport-strategies/google-oauth2/googleoauth2.strategy';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Request() req: { user: JwtResponse }) {
    return req.user;
  }

  @Get('google')
  @UseGuards(GoogleOAuth2Guard)
  googleAuth() {}

  @Get('google/callback')
  @UseGuards(GoogleOAuth2Guard)
  async googleAuthRedirect(@Request() req: { user: GoogleOAuth20Response }) {
    const { access_token, userInfo } = await this.authService.googleSignIn(
      req.user,
    );
    return {
      access_token,
      user: userInfo,
    };
  }
}
