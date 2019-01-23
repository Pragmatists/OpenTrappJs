import { Body, Controller, Get, HttpCode, Param, Post, Query, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ParseDatePipe } from '../shared/parse-date.pipe';
import { WorkLogService } from '../work-log/work-log.service';
import { Observable } from 'rxjs';
import { RegisterWorkLogDTO, WorkLogDTO } from '../work-log/work-log.model';
import { TagsService } from '../work-log/tags.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiImplicitQuery, ApiUseTags } from '@nestjs/swagger';
import { RolesGuard } from '../shared/roles.guard';
import { Roles } from '../shared/roles.decorator';

@Controller('api/v1/admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiUseTags('admin-work-log')
@ApiBearerAuth()
export class AdminWorkLogController {
  constructor(private readonly workLogService: WorkLogService,
              private readonly tagsService: TagsService) {
  }

  @Get('/work-log/entries')
  @ApiImplicitQuery({name: 'date', required: false, description: 'Day in format "YYYY-MM-DD"'})
  @ApiImplicitQuery({name: 'user', required: false, description: 'Username same as email but without domain'})
  @Roles('ADMIN', 'EXTERNAL_SERVICE')
  findWorkload(@Query('date', ParseDatePipe) date: Date,
               @Query('user') user: string): Observable<WorkLogDTO[]> {
    return this.workLogService.find(date, user);
  }

  @Post('/work-log/:username/entries')
  @HttpCode(201)
  @UsePipes(new ValidationPipe({transform: true}))
  @Roles('ADMIN', 'EXTERNAL_SERVICE')
  registerWorkLoad(@Param('username') username: string,
                   @Body() registerWorkloadDTO: RegisterWorkLogDTO): Observable<{id: string}> {
    return this.workLogService.register(username, registerWorkloadDTO);
  }

  @Get('/tags')
  @Roles('ADMIN', 'EXTERNAL_SERVICE')
  tags(): Observable<string[]> {
    return this.tagsService.findAll();
  }
}
