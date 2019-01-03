import { Controller, Get, Query } from '@nestjs/common';
import { ParseDatePipe } from '../shared/parse-date.pipe';
import { WorkLogService } from '../work-log/work-log.service';
import { Observable } from 'rxjs';
import { WorkLogDTO } from '../work-log/work-log.model';

@Controller('admin')
export class AdminController {

    constructor(private readonly workLogService: WorkLogService) {
    }

    @Get('/work-log/entries')
    public find(@Query('date', ParseDatePipe) date: Date, @Query('user') user: string): Observable<WorkLogDTO[]> {
        return this.workLogService.find(date, user);
    }
}
