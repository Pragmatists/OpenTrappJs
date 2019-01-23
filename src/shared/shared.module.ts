import { Module } from '@nestjs/common';
import { ParseDatePipe } from './parse-date.pipe';
import { ConfigService } from './config.service';
import { RolesGuard } from './roles.guard';

@Module({
  providers: [ParseDatePipe, ConfigService, RolesGuard],
  exports: [ParseDatePipe, ConfigService, RolesGuard]
})
export class SharedModule {
}
