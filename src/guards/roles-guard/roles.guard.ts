import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtResponse } from 'src/api/authentication/passport-strategies/jwt/jwt.strategy';
import { PrismaService } from 'src/db/prisma/prisma.service';
import { $Enums } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private db: PrismaService,
  ) {}

  async verifyUserRole(
    user: JwtResponse,
    roles: $Enums.Role[],
  ): Promise<boolean> {
    const userInfo = await this.db.user.findUnique({
      where: { id: user.id },
    });

    if (!userInfo) {
      return false;
    }

    console.log('Roles Guard', roles, userInfo.role);
    return roles.some((role) => userInfo.role === role);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<$Enums.Role[]>(
      'roles',
      context.getHandler(),
    );
    if (!roles) {
      return true;
    }

    const request: { user: JwtResponse } = context.switchToHttp().getRequest();
    const user: JwtResponse = request.user;

    if (!user) {
      return false;
    }

    return this.verifyUserRole(user, roles);
  }
}
