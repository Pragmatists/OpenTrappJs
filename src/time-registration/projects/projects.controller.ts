import { Controller, Get, Param, Query, Req, Request, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { Observable } from 'rxjs';
import { TagsService } from '../../work-log/tags.service';
import { WorkLogService } from '../../work-log/work-log.service';
import { map } from 'rxjs/operators';
import { ReportingWorkLogDTO } from '../time-registration.model';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UserDetails } from '../../auth/auth.model';
import { FindProjectsQueryParams } from './projects.model';

@Controller('api/v1/projects')
@ApiTags('project')
@UseGuards(AuthGuard('jwt'))
export class ProjectsController {

  constructor(private readonly tagsService: TagsService,
              private readonly workLogService: WorkLogService) {
  }

  @Get()
  @UsePipes(new ValidationPipe({transform: true}))
  @ApiQuery({name: 'dateFrom', required: false, description: 'Day in format "YYYY-MM-DD"'})
  getProjectNames(@Query() queryParams: FindProjectsQueryParams): Observable<string[]> {
    return this.tagsService.findAll(queryParams.dateFrom);
  }

  @Get('presets')
  getPresets(@Req() request: Request, @Query('limit') limit = 4): Observable<string[][]> {
    const userDetails: UserDetails = (request as any).user;
    return this.tagsService.findPresets(userDetails.name, limit);
  }

  @Get(':projectName/work-log/entries')
  entriesForProject(@Param('projectName') projectName: string): Observable<ReportingWorkLogDTO[]> {
    return this.workLogService.findByProject(projectName).pipe(
      map(workLogs => workLogs.map(ReportingWorkLogDTO.fromWorkLog))
    );
  }
}
