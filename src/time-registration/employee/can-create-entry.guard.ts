import { CanActivate, ExecutionContext } from '@nestjs/common';
import { UserDetails } from '../../auth/auth.model';

export class CanCreateEntryGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user: UserDetails = request.user;
    return user && user.name === request.params.employeeID;
  }
}
