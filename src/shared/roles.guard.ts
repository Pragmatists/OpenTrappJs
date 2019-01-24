import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserDetails } from '../auth/auth.model';
import { includes } from 'lodash';

@Injectable()
export class RolesGuard implements CanActivate {

  constructor(private readonly reflector: Reflector) {
  }

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user: UserDetails = request.user;
    return this.hasAnyRole(user, roles);
  }

  private hasAnyRole(user: UserDetails, roles: string[]): boolean {
    return user && user.roles && user.roles.some(role => includes(roles, role));
  }

}
