import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { from, Observable } from 'rxjs';
import { UserDetails } from '../../auth/auth.model';
import { WorkLogService } from '../../work-log/work-log.service';
import { map } from 'rxjs/operators';

@Injectable()
export class CanUpdateDeleteEntryGuard implements CanActivate {

  constructor(private readonly workLogService: WorkLogService) {
  }

  canActivate(context: ExecutionContext): Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user: UserDetails = request.user;
    const entryId: string = request.params.id;
    return this.userForEntry(entryId).pipe(
      map(username => username === user.name)
    );
  }

  private userForEntry(id: string): Observable<string> {
    return from(this.workLogService.findById(id)).pipe(
      map(workLog => workLog.employeeID)
    );
  }
}
