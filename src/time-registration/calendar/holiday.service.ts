import * as moment from 'moment';
import { HttpService, Injectable } from '@nestjs/common';
import { HolidayDTO } from './calendar.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface HolidayResponseElement {
  date: {
    year: number;
    month: number;
    day: number;
    dayOfWeek: number;
  };
  localName: string;
  englishName: string;
}

@Injectable()
export class HolidayService {
  private static readonly API_ROOT_URL = 'https://kayaposoft.com/enrico/json/v1.0';
  private static readonly DATE_FORMAT = 'DD-MM-YYYY';

  constructor(private readonly httpService: HttpService) {
  }

  holidaysInMonth(year: number, month: number): Observable<HolidayDTO[]> {
    const params = this.params(year, month);
    return this.httpService.get<HolidayResponseElement[]>(HolidayService.API_ROOT_URL, {params}).pipe(
      map(resp => resp.data),
      map(responseElements => responseElements.map(element => this.responseElementToHolidayDTO(element)))
    );
  }

  private params(year: number, month: number): {[key: string]: any} {
    const dayOfMonth = moment([year, month - 1, 1]);
    const fromDate = dayOfMonth.startOf('month').format(HolidayService.DATE_FORMAT);
    const toDate = dayOfMonth.endOf('month').format(HolidayService.DATE_FORMAT);
    return {
      action: 'getPublicHolidaysForDateRange',
      country: 'pol',
      fromDate,
      toDate
    };
  }

  private responseElementToHolidayDTO(responseElement: HolidayResponseElement): HolidayDTO {
    const date = responseElement.date;
    return {
      day: moment([date.year, date.month - 1, date.day])
    };
  }
}
