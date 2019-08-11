import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { from, Observable } from 'rxjs';
import { ServiceAccountService } from '../accounts/service-account.service';
import { UserDetails } from '../auth/auth.model';
import { map } from 'rxjs/operators';

@Injectable()
export class CanDeleteServiceAccountGuard implements CanActivate {
  constructor(private readonly serviceAccountService: ServiceAccountService) {
  }

  canActivate(context: ExecutionContext): Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user: UserDetails = request.user;
    const clientID: string = request.params.id;
    return this.ownerForServiceAccount(clientID).pipe(
      map(owner => owner === user.name)
    );
  }

  private ownerForServiceAccount(id: string): Observable<string> {
    return from(this.serviceAccountService.findByClientID(id)).pipe(
      map(serviceAccount => serviceAccount.owner)
    );
  }
}
