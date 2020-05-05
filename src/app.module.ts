import { Module } from '@nestjs/common';
import { AdminModule } from './admin/admin.module';
import { SharedModule } from './shared/shared.module';
import { WorkLogModule } from './work-log/work-log.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { TimeRegistrationModule } from './time-registration/time-registration.module';
import { CustomerReportsModule } from './customer-reports/customer-reports.module';

@Module({
  imports: [
    DatabaseModule,
    AdminModule,
    SharedModule,
    WorkLogModule,
    AuthModule,
    TimeRegistrationModule,
    CustomerReportsModule
  ]
})
export class AppModule {}
