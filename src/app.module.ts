import { Module } from '@nestjs/common';
import { AdminModule } from './admin/admin.module';
import { SharedModule } from './shared/shared.module';
import { WorkLogModule } from './work-log/work-log.module';
import { DatabaseModule } from './database/database.module';
import { CalendarModule } from './calendar/calendar.module';

@Module({
  imports: [
    DatabaseModule,
    AdminModule,
    SharedModule,
    WorkLogModule,
    CalendarModule
  ]
})
export class AppModule {}
