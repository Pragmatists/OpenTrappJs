import { Controller, Get, Param, ParseIntPipe, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { Observable } from 'rxjs';
import { ReportingResponseDTO, ReportingWorkLogDTO } from '../time-registration.model';
import { WorkLogService } from '../../work-log/work-log.service';
import { map } from 'rxjs/operators';
import { FindByYearAndMonthParams, FindByYearMonthListParams, YearDTO } from './calendar.model';
import { ApiUseTags } from '@nestjs/swagger';
import { YearMonth } from '../../work-log/time-unit';
import { AuthGuard } from '@nestjs/passport';

const CALENDAR_ROOT_URL = '/api/v1/calendar';

@Controller('calendar')
@ApiUseTags('calendar')
@UseGuards(AuthGuard('jwt'))
export class CalendarController {

  constructor(private readonly calendarService: CalendarService,
              private readonly workLogService: WorkLogService) {
  }

  @Get(':year/:month')
  getMonth(@Param('year', ParseIntPipe) year: number,
           @Param('month', ParseIntPipe) month: number) {
    return this.calendarService.getMonth(year, month, CALENDAR_ROOT_URL);
  }

  @Get(':year')
  getYear(@Param('year', ParseIntPipe) year: number): YearDTO {
    return this.calendarService.getYear(year, CALENDAR_ROOT_URL);
  }

  @Get(':year/:month/work-log/entries')
  @UsePipes(new ValidationPipe({transform: true}))
  entriesForMonth(@Param() params: FindByYearAndMonthParams): Observable<ReportingResponseDTO> {
    return this.workLogService.findByMonth(new YearMonth(params.year, params.month)).pipe(
      map(workLogs => workLogs.map(workLog => ReportingWorkLogDTO.fromWorkLog(workLog))),
      map(workLogs => ({items: workLogs}))
    );
  }

  @Get(':yearMonthList/work-log/entries')
  @UsePipes(new ValidationPipe({transform: true}))
  entriesForMonthList(@Param() params: FindByYearMonthListParams): Observable<ReportingResponseDTO> {
    return this.workLogService.findByMonthList(params.toList()).pipe(
      map(workLogs => workLogs.map(workLog => ReportingWorkLogDTO.fromWorkLog(workLog))),
      map(workLogs => ({items: workLogs}))
    );
  }
}
