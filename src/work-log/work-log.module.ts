import { Module } from '@nestjs/common';
import { WorkLogService } from './work-log.service';
import { MongooseModule } from '@nestjs/mongoose'
import { WorkLogSchema } from './work-log.schema';

@Module({
    imports: [MongooseModule.forFeature([{name: 'WorkLog', schema: WorkLogSchema, collection: 'workLogEntry'}])],
    providers: [WorkLogService],
    exports: [WorkLogService]
})
export class WorkLogModule {
}
