import { Model } from 'mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { v4 as uuid } from 'uuid';
import {CustomerToken, CustomerTokenDTO} from './customer-token.model';

@Injectable()
export class CustomerReportService {
    constructor(@InjectModel('CustomerToken') private readonly customerTokenModel: Model<CustomerToken>) {
    }

    findTagsByCustomerNameAndToken(customerName: string, token: string): Observable<string[]> {
        return from(this.customerTokenModel.findOne({customerName, token}).lean().exec()).pipe(
            map(customerToken => {
                if (!customerToken) {
                    throw new NotFoundException(`Couldn't find a token for customer '${customerName}'`);
                }
                return customerToken.tags;
            })
        );
    }

    register(customerName: string, tags: string[]): Observable<CustomerTokenDTO> {
        const token = uuid();
        const customerToken: CustomerTokenDTO = {customerName, tags, token};
        return from(this.customerTokenModel.findOneAndUpdate({customerName}, customerToken, {upsert: true, })).pipe(map(() => customerToken));
    }

}
