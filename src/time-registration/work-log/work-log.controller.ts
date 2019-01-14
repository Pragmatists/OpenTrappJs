import { Body, Controller, Delete, HttpCode, HttpStatus, Param, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { WorkLogService } from '../../work-log/work-log.service';
import { UpdateWorkLogDTO } from '../../work-log/work-log.model';
import { mapTo } from 'rxjs/operators';
import { ApiUseTags } from '@nestjs/swagger';

@Controller('/endpoints/v1/work-log')
@ApiUseTags('work-log')
export class WorkLogController {

  constructor(private readonly workLogService: WorkLogService) {
  }

  @Post('entries/:id')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({transform: true}))
  updateEntry(@Param('id') id: string, @Body() updateDTO: UpdateWorkLogDTO) {
    return this.workLogService.update(id, updateDTO).pipe(
      mapTo({status: 'success'})
    );
  }

  @Delete('entries/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteEntry(@Param('id') id: string) {
    return this.workLogService.delete(id);
  }

}
