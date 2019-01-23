import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { ServiceAccount, ServiceAccountDTO } from './accounts.model';
import { InjectModel } from '@nestjs/mongoose';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ServiceAccountService {
  constructor(@InjectModel('ServiceAccount') private readonly serviceAccountModel: Model<ServiceAccount>) {
  }

  findAll(): Observable<ServiceAccountDTO[]> {
    return from(this.serviceAccountModel.find({}).exec()).pipe(
      map(services => services.map(service => ({
        name: service.name,
        clientID: service.clientID,
        secret: service.secret,
        owner: service.owner
      })))
    );
  }
}
