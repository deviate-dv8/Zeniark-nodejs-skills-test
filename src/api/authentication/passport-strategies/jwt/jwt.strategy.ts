import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface JwtResponse {
  userId: string;
  email: string;
  role: string;
}
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'thequickbrownfox',
      issuer: 'NoteApp',
      audience: 'NoteApp',
    });
  }
  validate(payload: JwtPayload): JwtResponse {
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
