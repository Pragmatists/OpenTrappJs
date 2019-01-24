import { Injectable } from '@nestjs/common';
import { WorkLog } from './work-log.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { sortBy } from 'lodash';

@Injectable()
export class TagsService {
  constructor(@InjectModel('WorkLog') private readonly workLogModel: Model<WorkLog>) {
  }

  findAll(): Observable<string[]> {
    return from(this.workLogModel.distinct('projectNames.name').exec()).pipe(
      map(tags => sortBy(tags))
    );
  }
}
