export interface TimeUnit {
  searchRegex: string;
}

export class YearMonth implements TimeUnit {
  static readonly PATTERN = /\d{4}\/\d{2}/;

  constructor(readonly year: string,
              readonly month: string) {
  }

  get searchRegex(): string {
    return `${this.year}/${this.month}/(\\d{2})`;
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
