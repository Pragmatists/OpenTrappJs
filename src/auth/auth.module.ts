import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { HttpStrategy } from './http.strategy';
import { PassportModule } from '@nestjs/passport';
import { SharedModule } from '../shared/shared.module';
import { WorkLogSchema } from '../work-log/work-log.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthorizedUserService } from './authorized-user.service';

@Module({
  imports: [
    PassportModule.register({defaultStrategy: 'bearer'}),
    MongooseModule.forFeature([{name: 'AuthorizedUser', schema: WorkLogSchema, collection: 'authorizedUser'}])
  ],
  providers: [AuthService, HttpStrategy, SharedModule, AuthorizedUserService],
  exports: [PassportModule]
})
export class AuthModule {
}
