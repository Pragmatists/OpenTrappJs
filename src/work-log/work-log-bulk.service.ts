import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { from, Observable, of } from 'rxjs';
import { BulkUpdateDTO, WorkLogQuery } from './work-log-bulk.model';
import { Model } from 'mongoose';
import { WorkLog } from './work-log.model';
import { map } from 'rxjs/operators';
import { WorkLogBulkUpdater } from './work-log-bulk-updater';

@Injectable()
export class WorkLogBulkService {

  constructor(@InjectModel('WorkLog') private readonly workLogModel: Model<WorkLog>) {
  }

  validateQuery(queryString: string): Observable<number> {
    const query = WorkLogQuery.fromQueryString(queryString);
    return this.numberOfMatchingEntries(query);
  }

  bulkUpdate(updateDTO: BulkUpdateDTO): Observable<number> {
    const searchQuery = new WorkLogQuery(updateDTO.query);
    const bulkUpdater = new WorkLogBulkUpdater(updateDTO.expression);
    const bulkQuery = [{
      updateMany: {
        filter: searchQuery.toSearchCriteria(),
        update: bulkUpdater.addQuery
      }
    }, {
      updateMany: {
        filter: searchQuery.toSearchCriteria(),
        update: bulkUpdater.removeQuery
      }
    }];
    return from(this.workLogModel.bulkWrite(bulkQuery)).pipe(
      map(result => result.modifiedCount)
    );
  }

  private numberOfMatchingEntries(query: WorkLogQuery): Observable<number> {
    return from(this.workLogModel.find(query.toSearchCriteria()).exec()).pipe(
      map(entries => entries.length)
    );
  }
}
