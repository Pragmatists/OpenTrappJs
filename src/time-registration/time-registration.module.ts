import { Module } from '@nestjs/common';
import { ProjectNamesController } from './project-names/project-names.controller';
import {WorkLogModule} from '../work-log/work-log.module';

@Module({
  imports: [WorkLogModule],
  controllers: [ProjectNamesController]
})
export class TimeRegistrationModule {}
