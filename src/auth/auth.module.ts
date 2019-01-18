import { HttpModule, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleStrategy } from './google.strategy';
import { AuthorizedUserSchema } from './authorized-user.schema';
import { HttpStrategy } from './http.strategy';
import { SharedModule } from '../shared/shared.module';
import { AuthorizedUserService } from './authorized-user.service';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  controllers: [AuthController],
  imports: [
    HttpModule,
    PassportModule.register({defaultStrategy: 'bearer'}),
    MongooseModule.forFeature([{name: 'AuthorizedUser', schema: AuthorizedUserSchema, collection: 'authorizedUser'}])
  ],
  providers: [AuthService, HttpStrategy, SharedModule, AuthorizedUserService, GoogleStrategy],
  exports: [PassportModule]
})
export class AuthModule {}
