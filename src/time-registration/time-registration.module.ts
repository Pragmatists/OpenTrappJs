import { Module } from '@nestjs/common';
import { ProjectsController } from './projects/projects.controller';
import { WorkLogModule } from '../work-log/work-log.module';
import { CalendarController } from './calendar/calendar.controller';
import { CalendarService } from './calendar/calendar.service';
import { EmployeeController } from './employee/employee.controller';
import { WorkLogController } from './work-log/work-log.controller';
import { AuthModule } from '../auth/auth.module';
import { CanCreateEntryGuard } from './employee/can-create-entry.guard';

@Module({
  imports: [AuthModule, WorkLogModule],
  controllers: [ProjectsController, CalendarController, EmployeeController, WorkLogController],
  providers: [CalendarService, CanCreateEntryGuard]
})
export class TimeRegistrationModule {
}
