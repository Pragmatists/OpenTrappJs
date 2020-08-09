import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { WorkLogService } from '../../work-log/work-log.service';
import { UpdateWorkLogDTO } from '../../work-log/work-log.model';
import { map } from 'rxjs/operators';
import { ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { WorkLogBulkService } from '../../work-log/work-log-bulk.service';
import { BulkUpdateDTO } from '../../work-log/work-log-bulk.model';
import { AuthGuard } from '@nestjs/passport';
import { CanUpdateDeleteEntryGuard } from './can-update-delete-entry.guard';
import { RequestWithUser } from '../../auth/auth.model';
import { ReportingWorkLogDTO } from '../time-registration.model';

interface AffectedEntriesDTO {
  entriesAffected: number;
}

@Controller('api/v1/work-log')
@ApiTags('work-log')
@UseGuards(AuthGuard('jwt'))
export class WorkLogController {

  constructor(private readonly workLogService: WorkLogService,
              private readonly workLogBulkService: WorkLogBulkService) {
  }

  @Put('entries/:id')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({transform: true}))
  @UseGuards(CanUpdateDeleteEntryGuard)
  updateEntry(@Param('id') id: string, @Body() updateDTO: UpdateWorkLogDTO): Observable<ReportingWorkLogDTO> {
    return this.workLogService.update(id, updateDTO).pipe(
      map(ReportingWorkLogDTO.fromWorkLog)
    );
  }

  @Delete('entries/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(CanUpdateDeleteEntryGuard)
  deleteEntry(@Param('id') id: string) {
    return this.workLogService.delete(id);
  }

  @Get('bulk-update/:query')
  validateQuery(@Param('query') query: string): Observable<AffectedEntriesDTO> {
    return this.workLogBulkService.validateQuery(query).pipe(
      map(entriesAffected => ({entriesAffected}))
    );
  }

  @Get('bulk-update')
  validateEmptyQuery(): Observable<AffectedEntriesDTO> {
    return this.validateQuery('');
  }

  @Post('bulk-update')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({transform: true}))
  bulkUpdate(@Req() request: RequestWithUser,
             @Body() updateDTO: BulkUpdateDTO): Observable<AffectedEntriesDTO> {
    const name = request.user.name;
    return this.workLogBulkService.bulkUpdate(updateDTO, name).pipe(
      map(entriesAffected => ({entriesAffected}))
    );
  }
}
