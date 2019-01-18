import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { SharedModule } from '../shared/shared.module';
import { WorkLogModule } from '../work-log/work-log.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [SharedModule, WorkLogModule, AuthModule],
  controllers: [AdminController]
})
export class AdminModule {
}
