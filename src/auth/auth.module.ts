import { HttpModule, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleStrategy } from './google.strategy';
import { HttpStrategy } from './http.strategy';
import { SharedModule } from '../shared/shared.module';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { AccountsModule } from '../accounts/accounts.module';

@Module({
  controllers: [AuthController],
  imports: [
    HttpModule,
    AccountsModule,
    PassportModule.register({defaultStrategy: 'bearer'})
  ],
  providers: [AuthService, HttpStrategy, SharedModule, GoogleStrategy, JwtStrategy],
  exports: [PassportModule]
})
export class AuthModule {}
