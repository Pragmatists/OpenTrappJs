import { Controller, Get, Param, ParseIntPipe, UsePipes, ValidationPipe } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { Observable } from 'rxjs';
import { ReportingResponseDTO, ReportingWorkLogDTO } from '../time-registration.model';
import { WorkLogService } from '../../work-log/work-log.service';
import { map } from 'rxjs/operators';
import { FindByYearAndMonthParams, FindByYearMonthListParams, YearMonthDTO } from './calendar.model';

const CALENDAR_ROOT_URL = '/endpoints/v1/calendar';

@Controller(CALENDAR_ROOT_URL)
export class CalendarController {

  constructor(private readonly calendarService: CalendarService,
              private readonly workLogService: WorkLogService) {
  }

  @Get(':year/:month')
  public getMonth(@Param('year', ParseIntPipe) year: number,
                  @Param('month', ParseIntPipe) month: number) {
    return this.calendarService.getMonth(year, month, CALENDAR_ROOT_URL);
  }

  @Get(':year')
  public getYear(@Param('year', ParseIntPipe) year: number) {
    return this.calendarService.getYear(year, CALENDAR_ROOT_URL);
  }

  @Get(':year/:month/work-log/entries')
  @UsePipes(new ValidationPipe({transform: true}))
  public entriesForMonth(@Param() params: FindByYearAndMonthParams): Observable<ReportingResponseDTO> {
    return this.workLogService.findByMonth(new YearMonthDTO(params.year, params.month)).pipe(
      map(workLogs => workLogs.map(workLog => ReportingWorkLogDTO.fromWorkLog(workLog))),
      map(workLogs => ({items: workLogs}))
    );
  }

  @Get(':yearMonthList/work-log/entries')
  @UsePipes(new ValidationPipe({transform: true}))
  public entriesForMonthList(@Param() params: FindByYearMonthListParams): Observable<ReportingResponseDTO> {
    return this.workLogService.findByMonthList(params.toList()).pipe(
      map(workLogs => workLogs.map(workLog => ReportingWorkLogDTO.fromWorkLog(workLog))),
      map(workLogs => ({items: workLogs}))
    );
  }
}
