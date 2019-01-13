import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { RegisterWorkLogDTO, WorkLog, WorkLogDTO } from './work-log.model';
import { from, Observable } from 'rxjs';
import * as moment from 'moment';
import { map } from 'rxjs/operators';
import { v4 as uuid } from 'uuid';
import { WorkLogSearchCriteria } from './work-log-search-criteria';
import { YearMonthDTO } from '../time-registration/calendar/calendar.model';

@Injectable()
export class WorkLogService {
  constructor(@InjectModel('WorkLog') private readonly workLogModel: Model<WorkLog>) {
  }

  find(date: Date, user: string): Observable<WorkLogDTO[]> {
    const query = WorkLogSearchCriteria.builer
      .date(date)
      .user(user)
      .build();
    return this.findByQuery(query);
  }

  findByProject(projectName: string): Observable<WorkLogDTO[]> {
    const query = WorkLogSearchCriteria.builer
      .projectName(projectName)
      .build();
    return this.findByQuery(query);
  }

  findByMonth(yearMonth: YearMonthDTO): Observable<WorkLogDTO[]> {
    const query = WorkLogSearchCriteria.builer
      .month(yearMonth)
      .build();
    return this.findByQuery(query);
  }

  findByMonthList(monthList: YearMonthDTO[]): Observable<WorkLogDTO[]> {
    const query = WorkLogSearchCriteria.builer
      .monthList(monthList)
      .build();
    return this.findByQuery(query);
  }

  findByEmployeeID(employeeID: string): Observable<WorkLogDTO[]> {
    const query = WorkLogSearchCriteria.builer
      .user(employeeID)
      .build();
    return this.findByQuery(query);
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

  private findByQuery(query) {
    return from(this.workLogModel.find(query).exec()).pipe(
      map(workLogs => workLogs.map(w => WorkLogService.workLogEntityToDTO(w)))
    );
  }
}
