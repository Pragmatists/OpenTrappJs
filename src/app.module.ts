import { Module } from '@nestjs/common';
import { AdminModule } from './admin/admin.module';
import { SharedModule } from './shared/shared.module';
import { WorkLogModule } from './work-log/work-log.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    DatabaseModule,
    AdminModule,
    SharedModule,
    WorkLogModule,
    AuthModule
  ]
})
export class AppModule {}
