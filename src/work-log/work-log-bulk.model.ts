import { WorkLogSearchCriteria } from './work-log-search-criteria';
import { TimeUnit, YearMonth, YearMonthDay } from './time-unit';
import { Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BulkUpdateDTO {
  @ApiProperty()
  query: string;
  @Matches(/^(\+#[^\s]*|\-#[^\s]*)(\+#[^\s]*|\-#[^\s]*|\s)*$/)
  @ApiProperty()
  expression: string;
}

export class WorkLogQuery {
  readonly employees: string[];
  readonly projects: string[];
  readonly timeUnits: TimeUnit[];

  constructor(expression: string) {
    const expressionElements = expression.split(' ');
    this.employees = WorkLogQuery.extractElementsBySelector(expressionElements, '*');
    this.projects = WorkLogQuery.extractElementsBySelector(expressionElements, '#');
    this.timeUnits = WorkLogQuery.extractElementsBySelector(expressionElements, '@')
      .map(WorkLogQuery.parseTimeUnit);
  }

  toSearchCriteria(): { [key: string]: any } {
    return WorkLogSearchCriteria.builder
      .userList(this.employees)
      .projectNameList(this.projects)
      .timeUnits(this.timeUnits)
      .build();
  }

  static fromQueryString(query: string): WorkLogQuery {
    const decoded = query
      .replace(/!project=/g, '#')
      .replace(/!employee=/g, '*')
      .replace(/!date=/g, '@')
      .replace(/\+/g, ' ')
      .replace(/:/g, '/');
    return new WorkLogQuery(decoded);
  }

  private static extractElementsBySelector(expressionElements: string[], selector: string): string[] {
    return expressionElements
      .filter(element => element.startsWith(selector))
      .map(element => element.substring(1));
  }

  private static parseTimeUnit(timeUnit: string): TimeUnit {
    if (YearMonthDay.PATTERN.test(timeUnit)) {
      const parts = timeUnit.split('/');
      return new YearMonthDay(parts[0], parts[1], parts[2]);
    } else if (YearMonth.PATTERN.test(timeUnit)) {
      const parts = timeUnit.split('/');
      return YearMonth.fromStringValues(parts[0], parts[1]);
    }
    throw new Error(`Unexpected time unit: ${timeUnit}`);
  }
}
