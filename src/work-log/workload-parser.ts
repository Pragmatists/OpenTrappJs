import { toInteger, range, isNil } from 'lodash';
import { BadRequestException } from '@nestjs/common';

export class WorkloadParser {
  static PATTERN = /(?:([0-9]+)d)?\s?(?:([0-9]+)h)?\s?(?:([0-9]+)m)?/;

  private constructor() {
  }

  static toMinutes(workloadExpression: string): number {
    const matches = WorkloadParser.PATTERN.exec(workloadExpression);
    if (!WorkloadParser.validMatches(matches)) {
      throw new BadRequestException(`Invalid workload expression '${workloadExpression}'. Valid pattern is 'Xd Xh Xm'`);
    }
    const days = WorkloadParser.parseGroup(matches[1]);
    const hours = WorkloadParser.parseGroup(matches[2]);
    const minutes = WorkloadParser.parseGroup(matches[3]);

    return days * 8 * 60 + hours * 60 + minutes;
  }

  private static parseGroup(group: string): number {
    return group ? toInteger(group) : 0;
  }

  private static validMatches(matches: RegExpExecArray): boolean {
    return range(1, 4)
      .map(idx => matches[idx])
      .some(v => !isNil(v));
  }
}
