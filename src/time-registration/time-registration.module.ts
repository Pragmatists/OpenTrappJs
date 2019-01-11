import { Module } from '@nestjs/common';
import { ProjectsController } from './projects/projects.controller';
import {WorkLogModule} from '../work-log/work-log.module';
import {CalendarController} from './calendar/calendar.controller';
import {CalendarService} from './calendar/calendar.service';

@Module({
  imports: [WorkLogModule],
  controllers: [ProjectsController, CalendarController],
  providers: [CalendarService]
})
export class TimeRegistrationModule {}
