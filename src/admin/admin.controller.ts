import { Controller, Get, Query } from '@nestjs/common';
import { ParseDatePipe } from '../shared/parse-date.pipe';
import { WorkLogService } from '../work-log/work-log.service';
import { Observable } from 'rxjs';
import { WorkLogDTO } from '../work-log/work-log.model';
import { TagsService } from '../work-log/tags.service';

@Controller('admin')
export class AdminController {

    constructor(private readonly workLogService: WorkLogService, private readonly tagsService: TagsService) {
    }

    @Get('/work-log/entries')
    public findWorkload(@Query('date', ParseDatePipe) date: Date, @Query('user') user: string): Observable<WorkLogDTO[]> {
        return this.workLogService.find(date, user);
    }

    @Get('/tags')
    public tags() {
        return this.tagsService.findAll();
    }
}
