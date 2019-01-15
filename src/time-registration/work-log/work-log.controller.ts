import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { WorkLogService } from '../../work-log/work-log.service';
import { UpdateWorkLogDTO } from '../../work-log/work-log.model';
import { map, mapTo } from 'rxjs/operators';
import { ApiUseTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { WorkLogBulkService } from '../../work-log/work-log-bulk.service';
import { BulkUpdateDTO } from '../../work-log/work-log-bulk.model';

interface AffectedEntriesDTO {
  entriesAffected: number;
}

@Controller('/endpoints/v1/work-log')
@ApiUseTags('work-log')
export class WorkLogController {

  constructor(private readonly workLogService: WorkLogService,
              private readonly workLogBulkService: WorkLogBulkService) {
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

  @Get(':query')
  validateQuery(@Param('query') query: string): Observable<AffectedEntriesDTO> {
    return this.workLogBulkService.validateQuery(query).pipe(
      map(entriesAffected => ({entriesAffected}))
    );
  }

  @Get('/')
  validateEmptyQuery(): Observable<AffectedEntriesDTO> {
    return this.validateQuery('');
  }

  @Post('bulk-update')
  bulkUpdate(@Body() updateDTO: BulkUpdateDTO): Observable<AffectedEntriesDTO> {
    return this.workLogBulkService.bulkUpdate(updateDTO).pipe(
      map(entriesAffected => ({entriesAffected}))
    );
  }
}
