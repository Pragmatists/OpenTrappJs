import { Injectable } from '@nestjs/common';
import { WorkLog } from './work-log.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { from, Observable } from 'rxjs';

@Injectable()
export class TagsService {
    constructor(@InjectModel('WorkLog') private readonly workLogModel: Model<WorkLog>) {
    }

    public findAll(): Observable<string[]> {
        return from(this.workLogModel.distinct('projectNames.name').exec());
    }
}
