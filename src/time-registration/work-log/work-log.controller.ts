import { Controller, Delete, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { WorkLogService } from '../../work-log/work-log.service';

@Controller('/endpoints/v1/work-log')
export class WorkLogController {

  constructor(private readonly workLogService: WorkLogService) {
  }

  @Delete('entries/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  public deleteEntry(@Param('id') id: string) {
    return this.workLogService.delete(id);
  }

}
