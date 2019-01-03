import { Document } from 'mongoose';
import { ArrayNotEmpty, IsInt, Matches, Min } from 'class-validator';

export interface WorkLog extends Document {
    _id: {
        _id: string
    },
    _class: string,
    employeeID: {
        _id: string
    },
    day: {
        date: string
    },
    workload: {
        minutes: number
    },
    projectNames: { name: string }[],
    createdAt: Date,
    note: {
        text: string
    }
}

export interface WorkLogDTO {
    id: string;
    employeeID: string;
    day: string;
    workload: number;
    projectNames: string[];
    note?: string;
}

export class RegisterWorkloadDTO {
    @Matches(/^\d{4}\/(0[1-9]|1[012])\/(0[1-9]|[12][0-9]|3[01])$/)
    readonly day: string;
    @IsInt()
    @Min(0)
    readonly workload: number;
    @ArrayNotEmpty()
    readonly projectNames: string[];
    readonly note?: string;
}
