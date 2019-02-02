import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { Observable } from 'rxjs';
import { TagsService } from '../../work-log/tags.service';
import { WorkLogService } from '../../work-log/work-log.service';
import { map } from 'rxjs/operators';
import { ReportingResponseDTO, ReportingWorkLogDTO } from '../time-registration.model';
import { ApiUseTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

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

  @Get(':projectName/work-log/entries')
  entriesForProject(@Param('projectName') projectName: string): Observable<ReportingResponseDTO> {
    return this.workLogService.findByProject(projectName).pipe(
      map(workLogs => workLogs.map(workLog => ReportingWorkLogDTO.fromWorkLog(workLog))),
      map(workLogs => ({items: workLogs}))
    );
  }
}
