import { Type } from 'class-transformer';

export class FindProjectsQueryParams {
  @Type(() => Date)
  readonly dateFrom: Date;
}
