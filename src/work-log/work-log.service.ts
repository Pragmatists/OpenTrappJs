import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { RegisterWorkloadDTO, WorkLog, WorkLogDTO } from './work-log.model';
import { from, Observable } from 'rxjs';
import * as moment from 'moment';
import { map } from 'rxjs/operators';
import { v4 as uuid } from 'uuid';


@Injectable()
export class WorkLogService {
    constructor(@InjectModel('WorkLog') private readonly workLogModel: Model<WorkLog>) {
    }

    find(date: Date, user: string): Observable<WorkLogDTO[]> {
        let query = {};
        if (date) {
            query = {...query, 'day.date': moment(date).format('YYYY/MM/DD')};
        }
        if (user) {
            query = {...query, 'employeeID._id': user};
        }
        return from(this.workLogModel.find(query).exec()).pipe(
            map((worklog: WorkLog[]) => worklog.map(w => WorkLogService.workLogEntityToDTO(w)))
        );
    }

    private static workLogEntityToDTO(entity: WorkLog): WorkLogDTO {
        return {
            id: entity._id._id,
            day: entity.day.date,
            employeeID: entity.employeeID._id,
            projectNames: entity.projectNames.map(project => project.name),
            workload: entity.workload.minutes,
            note: entity.note ? entity.note.text : undefined
        }
    }

    register(username: string, registerWorkloadDTO: RegisterWorkloadDTO): Observable<{id: string}> {
        const workLog = {
            _id: {
                _id: `WL.${uuid()}`
            },
            day: {
                date: registerWorkloadDTO.day
            },
            employeeID: {
                _id: username
            },
            projectNames: registerWorkloadDTO.projectNames.map(name => ({name})),
            workload: {
                minutes: registerWorkloadDTO.workload
            },
            note: {
                text: registerWorkloadDTO.note
            },
            createdAt: new Date()
        } as WorkLog;
        return from(this.workLogModel.create(workLog)).pipe(
            map(document => ({id: document._id._id}))
        );
    }
}
