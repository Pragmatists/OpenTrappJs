import { Injectable } from '@nestjs/common';
import * as moment from 'moment';
import { DayDTO, MonthDTO, YearDTO } from './calendar.model';
import { range } from 'lodash';

@Injectable()
export class CalendarService {

  getMonth(year: number, month: number, rootUrl: string): MonthDTO {
    const firstDay = moment(new Date(year, month - 1, 1));
    const daysInMonth = firstDay.daysInMonth();
    const days = range(daysInMonth)
      .map(idx => idx + 1)
      .map(day => moment(new Date(year, month - 1, day)))
      .map(day => new DayDTO(day.format('YYYY/MM/DD'), this.isWeekend(day), rootUrl));
    return new MonthDTO(year, month, days, rootUrl);
  }

  getYear(year: number, rootUrl: string): YearDTO {
    const months = range(12)
      .map(idx => idx + 1)
      .map(month => new MonthDTO(year, month, undefined, rootUrl));
    return new YearDTO(year, months, rootUrl);
  }

  private isWeekend(date: moment.Moment): boolean {
    return date.isoWeekday() === 6 || date.isoWeekday() === 7;
  }
}
