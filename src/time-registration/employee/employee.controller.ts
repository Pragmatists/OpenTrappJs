import { Controller, Get, Param } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ReportingResponseDTO, ReportingWorkLogDTO } from '../time-registration.model';
import { WorkLogService } from '../../work-log/work-log.service';
import { map } from 'rxjs/operators';

@Controller('/endpoints/v1/employee')
export class EmployeeController {

  constructor(private readonly workLogService: WorkLogService) {
  }

  @Get(':employeeID/work-log/entries')
  public entriesForEmployee(@Param('employeeID') employeeID: string): Observable<ReportingResponseDTO>  {
    return this.workLogService.findByEmployeeID(employeeID).pipe(
      map(workLogs => workLogs.map(workLog => ReportingWorkLogDTO.fromWorkLog(workLog))),
      map(workLogs => ({items: workLogs}))
    );
  }
}
