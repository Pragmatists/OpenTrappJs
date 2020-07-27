import {Body, Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards, ValidationPipe} from '@nestjs/common';
import {ApiUseTags} from '@nestjs/swagger';
import {Observable} from 'rxjs';
import {CustomerReportService} from './customer-report.service';
import {ArrayNotEmpty, IsNotEmpty} from 'class-validator';
import {AuthGuard} from '@nestjs/passport';
import {CustomerTokenDTO} from './customer-token.model';
import {WorkLogService} from '../work-log/work-log.service';
import {flatMap} from 'rxjs/operators';
import * as moment from 'moment';
import {WorkLogDTO} from '../work-log/work-log.model';
import {Roles} from '../shared/roles.decorator';
import {RolesGuard} from '../shared/roles.guard';

export class GenerateCustomerTokenBody {
    @IsNotEmpty()
    customerName: string;
    @ArrayNotEmpty()
    tags: string[];
}

@Controller('api/v1/customer-reports')
@ApiUseTags('customer-reports')
export class CustomerReportController {

    constructor(private customerReportService: CustomerReportService, private workLogService: WorkLogService) {
    }

    @Post()
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('ADMIN')
    generateCustomerToken(@Body(new ValidationPipe({ transform: true })) body: GenerateCustomerTokenBody): Observable<CustomerTokenDTO> {
        return this.customerReportService.register(body.customerName, body.tags);
    }

    @Get(':customer/:year/:month')
    getReport(@Param('customer') customer: string,
              @Param('year', ParseIntPipe) year: number,
              @Param('month', ParseIntPipe) month: number,
              @Query('token') token: string): Observable<WorkLogDTO[]> {
        const dateFrom = moment([year, month - 1]).toDate();
        const dateTo = moment(dateFrom).endOf('month').toDate();

        return this.customerReportService.findTagsByCustomerNameAndToken(customer, token)
            .pipe(flatMap(tags => this.workLogService.find({dateFrom, dateTo, tags})));
    }

}
