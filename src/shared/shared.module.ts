import { Module } from '@nestjs/common';
import { ParseDatePipe } from './parse-date.pipe';
import { ConfigService } from './config.service';

@Module({
    providers: [ParseDatePipe, ConfigService],
    exports: [ParseDatePipe, ConfigService]
})
export class SharedModule {}
