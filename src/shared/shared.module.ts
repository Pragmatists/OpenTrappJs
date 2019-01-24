import { Module } from '@nestjs/common';
import { ParseDatePipe } from './parse-date.pipe';
import { ConfigService } from './config.service';
import { RolesGuard } from './roles.guard';
import { BcryptService } from './bcrypt.service';

@Module({
  providers: [ParseDatePipe, ConfigService, RolesGuard, BcryptService],
  exports: [ParseDatePipe, ConfigService, RolesGuard, BcryptService]
})
export class SharedModule {
}
