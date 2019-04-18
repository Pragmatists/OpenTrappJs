import { Injectable } from '@nestjs/common';
import { WorkLog, WorkLogDTO } from './work-log.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { sortBy, chain, identity, includes } from 'lodash';
import { WorkLogService } from './work-log.service';
import * as moment from 'moment';

@Injectable()
export class TagsService {
  constructor(@InjectModel('WorkLog') private readonly workLogModel: Model<WorkLog>,
              private readonly workLogService: WorkLogService) {
  }

  findAll(): Observable<string[]> {
    return from(this.workLogModel.distinct('projectNames.name').exec()).pipe(
        map(tags => sortBy(tags))
    );
  }

  findPresets(username: string): Observable<string[][]> {
    return from(this.workLogService.find({user: username, dateFrom: this.dateFrom})).pipe(
        map(this.presetsFromWorkLogs)
    );
  }

  private presetsFromWorkLogs(workLogs: WorkLogDTO[]): string[][] {
    const theMostRecentlyUsed = chain(workLogs)
        .sortBy(workLog => workLog.day)
        .reverse()
        .map(workLog => workLog.projectNames)
        .map(projectNames => projectNames.sort())
        .take(2)
        .value();
    const theMostOftenUsed = chain(workLogs)
        .map(workLog => workLog.projectNames.sort())
        .countBy(identity)
        .toPairs()
        .sortBy(pair => pair[1])
        .reverse()
        .map(pair => pair[0].split(','))
        .filter(tags => !includes(theMostRecentlyUsed, tags))
        .take(2)
        .value();
    return [...theMostRecentlyUsed, ...theMostOftenUsed];
  }

  private get dateFrom(): Date {
    return moment().subtract(30, 'days').toDate();
  }
}
