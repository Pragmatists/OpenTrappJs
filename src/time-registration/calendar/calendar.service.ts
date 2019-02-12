import { Injectable } from '@nestjs/common';
import * as moment from 'moment';
import { DayDTO, HolidayDTO, MonthDTO, YearDTO } from './calendar.model';
import { range } from 'lodash';
import { HolidayService } from './holiday.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable()
export class CalendarService {

  constructor(private readonly holidayService: HolidayService) {
  }

  getMonth(year: number, month: number, rootUrl: string): Observable<MonthDTO> {
    return this.holidayService.holidaysInMonth(year, month).pipe(
      map(holidays =>
        this.daysInMonth(year, month)
          .map(day => new DayDTO(day, this.isHoliday(day, holidays), rootUrl))
      ),
      map(days => new MonthDTO(year, month, days, rootUrl))
    );
  }

  getYear(year: number, rootUrl: string): YearDTO {
    const months = range(12)
      .map(idx => idx + 1)
      .map(month => new MonthDTO(year, month, undefined, rootUrl));
    return new YearDTO(year, months, rootUrl);
  }

  private isHoliday(date: moment.Moment, holidays: HolidayDTO[]): boolean {
    const match = holidays.find(h => date.diff(h.day, 'days') === 0);
    return match !== null && match !== undefined;
  }

  private daysInMonth(year: number, month: number): moment.Moment[] {
    const firstDay = moment(new Date(year, month - 1, 1));
    const daysInMonth = firstDay.daysInMonth();
    return range(daysInMonth)
      .map(idx => idx + 1)
      .map(day => moment(new Date(year, month - 1, day)));
  }
}
