import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { RegisterWorkLogDTO, WorkLog, WorkLogDTO } from './work-log.model';
import { from, Observable } from 'rxjs';
import * as moment from 'moment';
import { map } from 'rxjs/operators';
import { v4 as uuid } from 'uuid';
import { WorkLogSearchCriteria } from './work-log-search-criteria';

@Injectable()
export class WorkLogService {
  constructor(@InjectModel('WorkLog') private readonly workLogModel: Model<WorkLog>) {
  }

  find(date: Date, user: string): Observable<WorkLogDTO[]> {
    const query = WorkLogSearchCriteria.builer
      .date(date)
      .user(user)
      .build();
    return from(this.workLogModel.find(query).exec()).pipe(
      map(workLogs => workLogs.map(w => WorkLogService.workLogEntityToDTO(w)))
    );
  }

  findByProject(projectName: string): Observable<WorkLogDTO[]> {
    const query = WorkLogSearchCriteria.builer
      .projectName(projectName)
      .build();
    return from(this.workLogModel.find(query).exec()).pipe(
      map(workLogs => workLogs.map(w => WorkLogService.workLogEntityToDTO(w)))
    );
  }

  findByMonth(year: string, month: string): Observable<WorkLogDTO[]> {
    const query = WorkLogSearchCriteria.builer
      .yearAndMonth(year, month)
      .build();
    return from(this.workLogModel.find(query).exec()).pipe(
      map(workLogs => workLogs.map(w => WorkLogService.workLogEntityToDTO(w)))
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
    };
  }

  register(username: string, registerWorkLogDTO: RegisterWorkLogDTO): Observable<{id: string}> {
    const workLog = {
      _id: {
        _id: `WL.${uuid()}`
      },
      day: {
        date: moment(registerWorkLogDTO.day).format('YYYY/MM/DD')
      },
      employeeID: {
        _id: username
      },
      projectNames: registerWorkLogDTO.projectNames.map(name => ({name})),
      workload: {
        minutes: registerWorkLogDTO.workload
      },
      note: {
        text: registerWorkLogDTO.note
      },
      createdAt: new Date()
    } as WorkLog;
    return from(this.workLogModel.create(workLog)).pipe(
      map(document => ({id: document._id._id}))
    );
  }
}
