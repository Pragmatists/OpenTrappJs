import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { HttpStrategy } from './http.strategy';
import { PassportModule } from '@nestjs/passport';
import { SharedModule } from '../shared/shared.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthorizedUserService } from './authorized-user.service';
import { AuthorizedUserSchema } from './authorized-user.schema';

@Module({
  imports: [
    PassportModule.register({defaultStrategy: 'bearer'}),
    MongooseModule.forFeature([{name: 'AuthorizedUser', schema: AuthorizedUserSchema, collection: 'authorizedUser'}])
  ],
  providers: [AuthService, HttpStrategy, SharedModule, AuthorizedUserService],
  exports: [PassportModule]
})
export class AuthModule {
}
