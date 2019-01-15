import { Module } from '@nestjs/common';
import { WorkLogService } from './work-log.service';
import { MongooseModule } from '@nestjs/mongoose';
import { WorkLogSchema } from './work-log.schema';
import { TagsService } from './tags.service';
import { WorkLogBulkService } from './work-log-bulk.service';

@Module({
  imports: [
    MongooseModule.forFeature([{name: 'WorkLog', schema: WorkLogSchema, collection: 'workLogEntry'}])
  ],
  providers: [WorkLogService, TagsService, WorkLogBulkService],
  exports: [WorkLogService, TagsService, WorkLogBulkService]
})
export class WorkLogModule {
}
