import { Injectable } from '@nestjs/common';
import { WorkLog, WorkLogDTO } from './work-log.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { sortBy, chain, identity, includes, flatten } from 'lodash';
import { WorkLogService } from './work-log.service';
import * as moment from 'moment';

@Injectable()
export class TagsService {
  constructor(@InjectModel('WorkLog') private readonly workLogModel: Model<WorkLog>,
              private readonly workLogService: WorkLogService) {
  }

  findAll(dateFrom?: Date): Observable<string[]> {
    if (dateFrom) {
      return from(this.workLogModel.distinct(
        'projectNames.name',
        {'day.date': {$gte: this.formatDate(dateFrom)}}
      )).pipe(
        map(tags => sortBy(tags))
      );
    }
    return from(this.workLogModel.distinct('projectNames.name').exec()).pipe(
      map(tags => sortBy(tags))
    );
  }

  findPresets(username: string, limit: number): Observable<string[][]> {
    return from(this.workLogService.find({user: username, dateFrom: this.dateFrom})).pipe(
      map(workLogs => this.presetsFromWorkLogs(workLogs, limit))
    );
  }

  private presetsFromWorkLogs(workLogs: WorkLogDTO[], limit: number): string[][] {
    const mostOftenLimit = Math.floor(limit / 2);
    const mostRecentLimit = mostOftenLimit + limit % 2;
    const theMostRecentlyUsed = chain(workLogs)
      .sortBy(workLog => workLog.day)
      .reverse()
      .map(workLog => workLog.projectNames)
      .map(projectNames => projectNames.sort())
      .uniqBy(projectNames => projectNames.join())
      .take(mostRecentLimit)
      .value();
    const recentlyUsedAsStrings = theMostRecentlyUsed.map(preset => preset.join(','));
    const theMostOftenUsed = chain(workLogs)
      .map(workLog => workLog.projectNames.sort())
      .countBy(identity)
      .toPairs()
      .sortBy(pair => pair[1])
      .reverse()
      .map(pair => pair[0])
      .filter(tags => !includes(recentlyUsedAsStrings, tags))
      .map(tags => tags.split(','))
      .uniqBy(projectNames => projectNames.join())
      .take(mostOftenLimit)
      .value();
    return [...theMostRecentlyUsed, ...theMostOftenUsed];
  }

  private get dateFrom(): Date {
    return moment().subtract(30, 'days').toDate();
  }

  private formatDate(date: Date): string {
    return moment(date).format('YYYY/MM/DD');
  }
}
