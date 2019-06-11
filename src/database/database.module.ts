import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '../shared/config.service';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [SharedModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.dbUri,
        useNewUrlParser: true
      }),
      inject: [ConfigService]
    })
  ]
})
export class DatabaseModule {

}
