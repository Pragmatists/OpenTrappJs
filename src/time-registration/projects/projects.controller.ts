import { Controller, Get, Param, Req, Request, UseGuards } from '@nestjs/common';
import { Observable } from 'rxjs';
import { TagsService } from '../../work-log/tags.service';
import { WorkLogService } from '../../work-log/work-log.service';
import { map } from 'rxjs/operators';
import { ReportingWorkLogDTO } from '../time-registration.model';
import { ApiUseTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UserDetails } from '../../auth/auth.model';

@Controller('projects')
@ApiUseTags('project')
@UseGuards(AuthGuard('jwt'))
export class ProjectsController {

  constructor(private readonly tagsService: TagsService,
              private readonly workLogService: WorkLogService) {
  }

  @Get()
  getProjectNames(): Observable<string[]> {
    return this.tagsService.findAll();
  }

  @Get('presets')
  getPresets(@Req() request: Request): Observable<string[][]> {
    const userDetails: UserDetails = (request as any).user;
    return this.tagsService.findPresets(userDetails.name);
  }

  @Get(':projectName/work-log/entries')
  entriesForProject(@Param('projectName') projectName: string): Observable<ReportingWorkLogDTO[]> {
    return this.workLogService.findByProject(projectName).pipe(
      map(workLogs => workLogs.map(ReportingWorkLogDTO.fromWorkLog))
    );
  }
}
