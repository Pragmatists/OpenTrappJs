import { Controller, Get, Param, ParseIntPipe, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { Observable } from 'rxjs';
import { ReportingWorkLogDTO } from '../time-registration.model';
import { WorkLogService } from '../../work-log/work-log.service';
import { map } from 'rxjs/operators';
import { FindByYearMonthListParams, MonthDTO, YearDTO } from './calendar.model';
import { ApiBearerAuth, ApiImplicitParam, ApiUseTags } from '@nestjs/swagger';
import { YearMonth } from '../../work-log/time-unit';
import { AuthGuard } from '@nestjs/passport';

const CALENDAR_ROOT_URL = '/api/v1/calendar';

@Controller('calendar')
@UseGuards(AuthGuard('jwt'))
@ApiUseTags('calendar')
@ApiBearerAuth()
export class CalendarController {

  constructor(private readonly calendarService: CalendarService,
              private readonly workLogService: WorkLogService) {
  }

  @Get(':year/:month')
  getMonth(@Param('year', ParseIntPipe) year: number,
           @Param('month', ParseIntPipe) month: number): Observable<MonthDTO> {
    return this.calendarService.getMonth(year, month, CALENDAR_ROOT_URL);
  }

  @Get(':year')
  getYear(@Param('year', ParseIntPipe) year: number): YearDTO {
    return this.calendarService.getYear(year, CALENDAR_ROOT_URL);
  }

  @Get(':year/:month/work-log/entries')
  entriesForMonth(@Param('year', ParseIntPipe) year: number,
                  @Param('month', ParseIntPipe) month: number): Observable<ReportingWorkLogDTO[]> {
    return this.workLogService.findByMonth(new YearMonth(year, month)).pipe(
      map(workLogs => workLogs.map(workLog => ReportingWorkLogDTO.fromWorkLog(workLog)))
    );
  }

  @Get(':yearMonthList/work-log/entries')
  @UsePipes(new ValidationPipe({transform: true}))
  @ApiImplicitParam({name: 'yearMonthList', required: true, description: 'List of years and months, e.g. 201811,201812,201901'})
  entriesForMonthList(@Param() params: FindByYearMonthListParams): Observable<ReportingWorkLogDTO[]> {
    return this.workLogService.findByMonthList(params.toList()).pipe(
      map(workLogs => workLogs.map(workLog => ReportingWorkLogDTO.fromWorkLog(workLog)))
    );
  }
}
