import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthorizedUserService } from './authorized-user.service';
import { AuthorizedUserSchema } from './authorized-user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{name: 'AuthorizedUser', schema: AuthorizedUserSchema, collection: 'authorizedUser'}])
  ],
  providers: [AuthorizedUserService],
  exports: [AuthorizedUserService]
})
export class AccountsModule {}
