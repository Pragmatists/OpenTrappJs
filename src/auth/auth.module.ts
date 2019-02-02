import { HttpModule, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SharedModule } from '../shared/shared.module';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { AccountsModule } from '../accounts/accounts.module';
import { GoogleClient } from './google-client';

@Module({
  controllers: [AuthController],
  imports: [
    HttpModule,
    AccountsModule,
    PassportModule.register({defaultStrategy: 'jwt'})
  ],
  providers: [AuthService, SharedModule, JwtStrategy, GoogleClient],
  exports: [PassportModule]
})
export class AuthModule {}
