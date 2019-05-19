import { Document } from 'mongoose';
import { ArrayNotEmpty, Matches } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { WorkloadParser } from './workload-parser';
import { Transform, Type } from 'class-transformer';
import { BadRequestException } from '@nestjs/common';

export interface WorkLog extends Document {
  _id: {
    _id: string;
  };
  _class: string;
  employeeID: {
    _id: string;
  };
  day: {
    date: string;
  };
  workload: {
    minutes: number;
  };
  projectNames: {name: string}[];
  createdAt: Date;
  note: {
    text: string;
  };
}

export interface WorkLogDTO {
  id: string;
  employeeID: string;
  day: string;
  workload: number;
  projectNames: string[];
  note?: string;
}

class Workload {
  readonly minutes: number;
  constructor(readonly expression: string) {
    this.minutes = WorkloadParser.toMinutes(expression);
  }
}

export class UpdateWorkLogDTO {
  @Transform(v => new Workload(v), {toClassOnly: true})
  readonly workload: Workload;
  @ApiModelProperty({example: ['internal', 'hackathon']})
  @ArrayNotEmpty()
  readonly projectNames: string[];
  @ApiModelProperty({required: false, example: 'Working remotely'})
  readonly note?: string;

  get workloadMinutes(): number {
    return this.workload.minutes;
  }
}

export class RegisterWorkLogDTO extends UpdateWorkLogDTO {
  @ApiModelProperty({example: '2019-01-05'})
  @Matches(/^\d{4}[\/\-](0[1-9]|1[012])[\/\-](0[1-9]|[12][0-9]|3[01])$/)
  readonly day: string;
}

export interface FindWorkloadQuery {
  readonly date?: Date;
  readonly dateFrom?: Date;
  readonly dateTo?: Date;
  readonly tags?: string[];
  readonly user?: string;
}

export class FindWorkloadQueryParams implements FindWorkloadQuery {
  @Type(() => Date)
  readonly date: Date;
  @Type(() => Date)
  readonly dateFrom: Date;
  @Type(() => Date)
  readonly dateTo: Date;
  @Transform(value => value ? value.split(',') : [])
  readonly tags: string[];
  readonly user: string;

  validate() {
    if (this.date && (this.dateFrom || this.dateTo)) {
      throw new BadRequestException(`date and dateFrom or dateTo can't be specified at the same time`);
    }
  }
}
