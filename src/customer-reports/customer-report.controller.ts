import {Body, Controller, Post, UseGuards, UsePipes, ValidationPipe} from '@nestjs/common';
import {ApiUseTags} from '@nestjs/swagger';
import {of, Observable} from 'rxjs';
import {CustomerReportService} from './customer-report.service';
import {ArrayNotEmpty, IsNotEmpty} from 'class-validator';
import {AuthGuard} from '@nestjs/passport';
import {CustomerTokenDTO} from './customer-token.model';

export class GenerateCustomerTokenBody {
    @IsNotEmpty()
    customerName: string;
    @ArrayNotEmpty()
    tags: string[];
}

@Controller('api/v1/customer-reports')
@ApiUseTags('customer-reports')
export class CustomerReportController {

    constructor(private customerReportService: CustomerReportService) {
    }

    @Post()
    @UseGuards(AuthGuard('jwt'))
    generateCustomerToken(@Body(new ValidationPipe({ transform: true })) body: GenerateCustomerTokenBody): Observable<CustomerTokenDTO> {
        return this.customerReportService.register(body.customerName, body.tags);
    }

}
