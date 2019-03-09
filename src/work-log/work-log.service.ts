import { Model } from 'mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FindWorkloadQueryParams, RegisterWorkLogDTO, UpdateWorkLogDTO, WorkLog, WorkLogDTO } from './work-log.model';
import { from, Observable } from 'rxjs';
import * as moment from 'moment';
import { filter, map, mapTo, throwIfEmpty } from 'rxjs/operators';
import { v4 as uuid } from 'uuid';
import { WorkLogSearchCriteria } from './work-log-search-criteria';
import { YearMonth } from './time-unit';
import { isNil, has, sortBy, trim } from 'lodash';

@Injectable()
export class WorkLogService {
  constructor(@InjectModel('WorkLog') private readonly workLogModel: Model<WorkLog>) {
  }

  findById(id: string): Observable<WorkLogDTO> {
    return from(this.workLogModel.findById({_id: id}).exec()).pipe(
      filter(workLog => !isNil(workLog)),
      throwIfEmpty(() => new NotFoundException(`Entry with id ${id} does not exists`)),
      map(workLog => WorkLogService.workLogEntityToDTO(workLog))
    );
  }

  find(queryParam: FindWorkloadQueryParams): Observable<WorkLogDTO[]> {
    queryParam.validate();
    const query = WorkLogSearchCriteria.builer
      .date(queryParam.date)
      .dateRange(queryParam.dateFrom, queryParam.dateTo)
      .user(queryParam.user)
      .projectNameList(queryParam.tags)
      .build();
    return this.findByQuery(query);
  }

  findByProject(projectName: string): Observable<WorkLogDTO[]> {
    const query = WorkLogSearchCriteria.builer
      .projectName(projectName)
      .build();
    return this.findByQuery(query);
  }

  findByMonth(yearMonth: YearMonth): Observable<WorkLogDTO[]> {
    const query = WorkLogSearchCriteria.builer
      .timeUnit(yearMonth)
      .build();
    return this.findByQuery(query);
  }

  findByMonthList(monthList: YearMonth[]): Observable<WorkLogDTO[]> {
    const query = WorkLogSearchCriteria.builer
      .timeUnits(monthList)
      .build();
    return this.findByQuery(query);
  }

  findByEmployeeID(employeeID: string): Observable<WorkLogDTO[]> {
    const query = WorkLogSearchCriteria.builer
      .user(employeeID)
      .build();
    return this.findByQuery(query);
  }

  register(username: string, registerWorkLogDTO: RegisterWorkLogDTO): Observable<{ id: string }> {
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
      projectNames: registerWorkLogDTO.projectNames.map(trim).map(name => ({name})),
      workload: {
        minutes: registerWorkLogDTO.workloadMinutes
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

  update(id: string, updateDTO: UpdateWorkLogDTO) {
    let workLog: any = {
      projectNames: updateDTO.projectNames.map(name => ({name})),
      workload: {
        minutes: updateDTO.workloadMinutes
      },
    };
    if (has(updateDTO, 'note')) {
      workLog = {
        ...workLog,
        note: {
          text: updateDTO.note
        }
      };
    }
    return from(this.workLogModel.findByIdAndUpdate({_id: id}, workLog).exec()).pipe(
      filter(updatedWorkLog => !isNil(updatedWorkLog)),
      mapTo({}),
      throwIfEmpty(() => new NotFoundException(`Entity with id ${id} doesn't exist`))
    );
  }

  delete(id: string): Observable<{}> {
    return from(this.workLogModel.findByIdAndDelete({_id: id}).exec()).pipe(
      filter(workLog => !isNil(workLog)),
      mapTo({}),
      throwIfEmpty(() => new NotFoundException(`Entity with id ${id} doesn't exist`))
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
      map(workLogs => workLogs.map(w => WorkLogService.workLogEntityToDTO(w))),
      map(workLogs => sortBy(workLogs, workLog => workLog.day))
    );
  }
}
