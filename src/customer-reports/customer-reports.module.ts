import {HttpModule, Module} from '@nestjs/common';
import {AuthModule} from '../auth/auth.module';
import {CustomerReportController} from './customer-report.controller';
import {MongooseModule} from '@nestjs/mongoose';
import {CustomerTokenSchema} from './customer-token.schema';
import {CustomerReportService} from './customer-report.service';
import {WorkLogModule} from '../work-log/work-log.module';

@Module({
    imports: [AuthModule, HttpModule, WorkLogModule,
        MongooseModule.forFeature([{name: 'CustomerToken', schema: CustomerTokenSchema, collection: 'customerTokens'}])
    ],
    controllers: [CustomerReportController],
    providers: [CustomerReportService]
})
export class CustomerReportsModule {
}
