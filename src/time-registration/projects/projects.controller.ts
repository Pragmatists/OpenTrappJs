import { Controller, Get, Param } from '@nestjs/common';
import { Observable } from 'rxjs';
import { TagsService } from '../../work-log/tags.service';
import { WorkLogService } from '../../work-log/work-log.service';
import { map } from 'rxjs/operators';
import { ReportingResponseDTO, ReportingWorkLogDTO } from '../time-registration.model';

@Controller('endpoints/v1/projects')
export class ProjectsController {

  constructor(private readonly tagsService: TagsService,
              private readonly workLogService: WorkLogService) {
  }

  @Get()
  public getProjectNames(): Observable<string[]> {
    return this.tagsService.findAll();
  }

  @Get(':projectName/work-log/entries')
  public entriesForProject(@Param('projectName') projectName: string): Observable<ReportingResponseDTO> {
    return this.workLogService.findByProject(projectName).pipe(
      map(workLogs => workLogs.map(workLog => ReportingWorkLogDTO.fromWorkLog(workLog))),
      map(workLogs => ({items: workLogs}))
    );
  }
}
