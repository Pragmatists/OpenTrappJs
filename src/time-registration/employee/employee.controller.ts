import { Body, Controller, Get, HttpCode, Param, Post, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ReportingWorkLogDTO } from '../time-registration.model';
import { WorkLogService } from '../../work-log/work-log.service';
import { map } from 'rxjs/operators';
import { RegisterWorkLogDTO } from '../../work-log/work-log.model';
import { ApiUseTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CanCreateEntryGuard } from './can-create-entry.guard';

@Controller('employee')
@ApiUseTags('employee')
@UseGuards(AuthGuard('jwt'))
export class EmployeeController {

  constructor(private readonly workLogService: WorkLogService) {
  }

  @Get(':employeeID/work-log/entries')
  entriesForEmployee(@Param('employeeID') employeeID: string): Observable<ReportingWorkLogDTO[]>  {
    return this.workLogService.findByEmployeeID(employeeID).pipe(
      map(workLogs => workLogs.map(workLog => ReportingWorkLogDTO.fromWorkLog(workLog)))
    );
  }

  @Post(':employeeID/work-log/entries')
  @HttpCode(201)
  @UsePipes(new ValidationPipe({transform: true}))
  @UseGuards(CanCreateEntryGuard)
  submitEntry(@Param('employeeID') employeeID: string,
              @Body() workLog: RegisterWorkLogDTO): Observable<{id: string}> {
    return this.workLogService.register(employeeID, workLog);
  }
}
