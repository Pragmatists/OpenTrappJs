import { Module } from '@nestjs/common';
import { AdminWorkLogController } from './admin-work-log.controller';
import { SharedModule } from '../shared/shared.module';
import { WorkLogModule } from '../work-log/work-log.module';
import { AuthModule } from '../auth/auth.module';
import { AdminAccountsController } from './admin-accounts.controller';

@Module({
  imports: [SharedModule, WorkLogModule, AuthModule],
  controllers: [AdminWorkLogController, AdminAccountsController]
})
export class AdminModule {
}
