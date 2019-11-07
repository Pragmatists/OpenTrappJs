import { Module } from '@nestjs/common';
import { AdminWorkLogController } from './admin-work-log.controller';
import { SharedModule } from '../shared/shared.module';
import { WorkLogModule } from '../work-log/work-log.module';
import { AuthModule } from '../auth/auth.module';
import { AdminAccountsController } from './admin-accounts.controller';
import { CanDeleteServiceAccountGuard } from './can-delete-service-account.guard';
import { AccountsModule } from '../accounts/accounts.module';
import { WellKnownController } from './well-known.controller';

@Module({
  imports: [SharedModule, WorkLogModule, AuthModule, AccountsModule],
  controllers: [AdminWorkLogController, AdminAccountsController, WellKnownController],
  providers: [CanDeleteServiceAccountGuard]
})
export class AdminModule {
}
