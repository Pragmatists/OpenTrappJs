import { Body, Controller, Get, HttpCode, Param, Post, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ParseDatePipe } from '../shared/parse-date.pipe';
import { WorkLogService } from '../work-log/work-log.service';
import { Observable } from 'rxjs';
import { RegisterWorkloadDTO, WorkLogDTO } from '../work-log/work-log.model';
import { TagsService } from '../work-log/tags.service';

@Controller('admin')
export class AdminController {

    constructor(private readonly workLogService: WorkLogService,
                private readonly tagsService: TagsService) {
    }

    @Get('/work-log/entries')
    public findWorkload(@Query('date', ParseDatePipe) date: Date, @Query('user') user: string): Observable<WorkLogDTO[]> {
        return this.workLogService.find(date, user);
    }

    @Post('/work-log/:username/entries')
    @HttpCode(201)
    @UsePipes(new ValidationPipe({transform: true}))
    public registerWorkLoad(@Param('username') username: string, @Body() registerWorkloadDTO: RegisterWorkloadDTO): Observable<{id: string}> {
        return this.workLogService.register(username, registerWorkloadDTO);
    }

    @Get('/tags')
    public tags(): Observable<string[]> {
        return this.tagsService.findAll();
    }
}
