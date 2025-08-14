import { Request } from '@nestjs/common';
import type { JwtResponse } from '../authentication/passport-strategies/jwt/jwt.strategy';
export interface RequestJwt extends Request {
  user: JwtResponse;
}
