import { BadRequestException } from '@nestjs/common';

export interface TimeUnit {
  searchRegex: string;
}

export class YearMonth implements TimeUnit {
  static readonly PATTERN = /\d{4}\/\d{2}/;

  constructor(readonly year: number,
              readonly month: number) {
    if (month < 1 || month > 12) {
      throw new BadRequestException('Invalid month');
    }
  }

  get searchRegex(): string {
    return `${this.year}/${this.formattedMonth()}/(\\d{2})`;
  }

  private formattedMonth(): string {
    return this.month < 10 ? `0${this.month}` : `${this.month}`;
  }

  static fromStringValues(year: string, month: string): YearMonth {
    return new YearMonth(Number(year), Number(month));
  }
}

export class YearMonthDay implements TimeUnit {
  static readonly PATTERN = /\d{4}\/\d{2}\/\d{2}/;

  constructor(readonly year: string,
              readonly month: string,
              readonly day: string) {
  }

  get searchRegex(): string {
    return `${this.year}/${this.month}/${this.day}`;
  }
}
