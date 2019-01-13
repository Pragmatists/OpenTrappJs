import { Body, Controller, Get, HttpCode, Param, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ReportingResponseDTO, ReportingWorkLogDTO } from '../time-registration.model';
import { WorkLogService } from '../../work-log/work-log.service';
import { map } from 'rxjs/operators';
import { RegisterWorkLogDTO } from '../../work-log/work-log.model';

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

  @Post(':employeeID/work-log/entries')
  @HttpCode(201)
  @UsePipes(new ValidationPipe({transform: true}))
  public submitEntry(@Param('employeeID') employeeID: string,
                     @Body() workLog: RegisterWorkLogDTO): Observable<{id: string}> {
    return this.workLogService.register(employeeID, workLog);
  }
}
