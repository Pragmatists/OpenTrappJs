import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { SharedModule } from '../shared/shared.module';
import { WorkLogModule } from '../work-log/work-log.module';
import { ServiceAuthModule } from '../service-auth/service-auth.module';

@Module({
  imports: [SharedModule, WorkLogModule, ServiceAuthModule],
  controllers: [AdminController]
})
export class AdminModule {}
