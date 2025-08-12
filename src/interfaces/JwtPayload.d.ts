declare interface JwtPayload {
  email: string;
  role: 'USER' | 'ADMIN';
  sub: string;
  iat: string;
  exp: string;
}
