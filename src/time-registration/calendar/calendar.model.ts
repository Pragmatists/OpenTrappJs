import { Matches } from 'class-validator';

export class YearDTO {
  readonly id: string;
  readonly link: string;
  readonly next: LinkDTO;
  readonly prev: LinkDTO;

  constructor(year: number, readonly months: MonthDTO[], rootUrl: string) {
    this.id = `${year}`;
    this.link = `${rootUrl}/${year}`;
    this.next = {
      link: `${rootUrl}/${year + 1}`
    };
    this.prev = {
      link: `${rootUrl}/${year - 1}`
    };
  }
}

export class MonthDTO {
  readonly id: string;
  readonly link: string;
  readonly next: LinkDTO;
  readonly prev: LinkDTO;

  constructor(year: number,
              month: number,
              readonly days: DayDTO[],
              rootUrl: string) {
    this.id = MonthDTO.toYearMonthString(year, month);
    this.link = `${rootUrl}/${this.id}`;
    const nextYear = month === 12 ? year + 1 : year;
    const prevYear = month === 1 ? year - 1 : year;
    const nextMonth = month === 12 ? 1 : month + 1;
    const prevMonth = month === 1 ? 12 : month - 1;
    this.next = {
      link: `${rootUrl}/${MonthDTO.toYearMonthString(nextYear, nextMonth)}`
    };
    this.prev = {
      link: `${rootUrl}/${MonthDTO.toYearMonthString(prevYear, prevMonth)}`
    };
  }

  private static toYearMonthString(year: number, month: number) {
    return `${year}/${month.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false})}`;
  }
}

export class DayDTO {
  readonly link: string;

  constructor(readonly id: string,
              readonly holiday: boolean,
              rootUrl: string) {
    this.link = `${rootUrl}/${id}`;
  }
}

export interface LinkDTO {
  readonly link: string;
}

export class FindByYearAndMonthParams {
  @Matches(/^\d{4}$/)
  year: string;
  @Matches(/^(0[1-9]|1[012])$/)
  month: string;
}

export class YearMonthDTO {
  constructor(readonly year: string,
              readonly month: string) {
  }

  get searchRegex(): string {
    return `${this.year}/${this.month}/(\\d{2})`;
  }
}

export class FindByYearMonthListParams {
  @Matches(/^(?:[\d]{6})(?:\,[\d]{6})*$/)
  yearMonthList: string;

  toList(): YearMonthDTO[] {
    return this.yearMonthList
      .split(',')
      .map(yearMonthString => yearMonthString.match(/(^\d{4})|(\d{2}$)/g))
      .map(splitYearMonth => new YearMonthDTO(splitYearMonth[0], splitYearMonth[1]));
  }
}
