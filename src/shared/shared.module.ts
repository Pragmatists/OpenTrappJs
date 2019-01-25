import { Module } from '@nestjs/common';
import { ConfigService } from './config.service';
import { RolesGuard } from './roles.guard';
import { BcryptService } from './bcrypt.service';

@Module({
  providers: [ConfigService, RolesGuard, BcryptService],
  exports: [ConfigService, RolesGuard, BcryptService]
})
export class SharedModule {
}
