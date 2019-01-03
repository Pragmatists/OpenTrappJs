import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './admin/admin.module';
import { SharedModule } from './shared/shared.module';
import { MongooseModule } from '@nestjs/mongoose';
import { WorkLogModule } from './work-log/work-log.module';
import { ConfigService } from './shared/config.service';

@Module({
    imports: [
        MongooseModule.forRootAsync({
            imports: [SharedModule],
            useFactory: async (configService: ConfigService) => ({
                uri: configService.dbUri
            }),
            inject: [ConfigService]
        }),
        AdminModule,
        SharedModule,
        WorkLogModule
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {
}
