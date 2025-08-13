import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Role } from '@prisma/client';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface JwtResponse {
  id: string;
  email: string;
  role: Role;
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
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}
