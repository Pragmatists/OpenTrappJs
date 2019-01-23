import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthorizedUserService } from './authorized-user.service';
import { AuthorizedUserSchema } from './authorized-user.schema';
import { ServiceAccountSchema } from './service-account.schema';
import { ServiceAccountService } from './service-account.service';

@Module({
  imports: [
    MongooseModule.forFeature([{name: 'AuthorizedUser', schema: AuthorizedUserSchema, collection: 'authorizedUser'}]),
    MongooseModule.forFeature([{name: 'ServiceAccount', schema: ServiceAccountSchema, collection: 'serviceAccount'}])
  ],
  providers: [AuthorizedUserService, ServiceAccountService],
  exports: [AuthorizedUserService, ServiceAccountService]
})
export class AccountsModule {}
