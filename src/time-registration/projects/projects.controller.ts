import {Controller, Get} from '@nestjs/common';
import {Observable} from 'rxjs';
import {TagsService} from '../../work-log/tags.service';

@Controller('endpoints/v1/projects')
export class ProjectsController {

  constructor(private readonly tagsService: TagsService) {
  }

  @Get()
  public getProjectNames(): Observable<string[]> {
    return this.tagsService.findAll();
  }
}
