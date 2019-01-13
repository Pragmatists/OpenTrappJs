import { WorkloadParser } from './workload-parser';
import { BadRequestException } from '@nestjs/common';

describe('WorkLoadParser', () => {
  it('should parse minutes', () => {
    const expression = '120m';
    const result = 120;

    expect(WorkloadParser.toMinutes(expression)).toEqual(result);
  });

  it('should parse hours', () => {
    const expression = '3h';
    const result = 60 * 3;

    expect(WorkloadParser.toMinutes(expression)).toEqual(result);
  });

  it('should parse days', () => {
    const expression = '1d';
    const result = 60 * 8;

    expect(WorkloadParser.toMinutes(expression)).toEqual(result);
  });

  it('should parse hours and minutes', () => {
    const expression = '1h 45m';
    const result = 60 + 45;

    expect(WorkloadParser.toMinutes(expression)).toEqual(result);
  });

  it('should parse days and minutes', () => {
    const expression = '1d 30m';
    const result = 60 * 8 + 30;

    expect(WorkloadParser.toMinutes(expression)).toEqual(result);
  });

  it('should parse days and hours', () => {
    const expression = '1d 4h';
    const result = 60 * 8 + 60 * 4;

    expect(WorkloadParser.toMinutes(expression)).toEqual(result);
  });

  it('should parse complete expression', () => {
    const expression = '2d 4h 30m';
    const result = 60 * 16 + 60 * 4 + 30;

    expect(WorkloadParser.toMinutes(expression)).toEqual(result);
  });

  it('should throw exception for invalid expression', () => {
    const expression = 'invalid expr';

    expect(() => WorkloadParser.toMinutes(expression)).toThrow(BadRequestException);
  });
});
