import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { CalendarService } from './calendar.service';

const CALENDAR_ROOT_URL = '/endpoints/v1/calendar';

@Controller(CALENDAR_ROOT_URL)
export class CalendarController {

  constructor(private readonly calendarService: CalendarService) {
  }

  @Get(':year/:month')
  public getMonth(@Param('year', ParseIntPipe) year: number, @Param('month', ParseIntPipe) month: number) {
    return this.calendarService.getMonth(year, month, CALENDAR_ROOT_URL);
  }

  @Get(':year')
  public getYear(@Param('year', ParseIntPipe) year: number) {
    return this.calendarService.getYear(year, CALENDAR_ROOT_URL);
  }
}
