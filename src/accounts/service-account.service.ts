import { ConflictException, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { CreateServiceAccountDTO, CreateServiceAccountResponse, ServiceAccount, ServiceAccountDTO } from './accounts.model';
import { InjectModel } from '@nestjs/mongoose';
import { from, Observable } from 'rxjs';
import { catchError, filter, mergeMap, map, mapTo } from 'rxjs/operators';
import { v4 as uuid } from 'uuid';
import { BcryptService } from '../shared/bcrypt.service';
import { isNil, sortBy } from 'lodash';

@Injectable()
export class ServiceAccountService {

  constructor(@InjectModel('ServiceAccount') private readonly serviceAccountModel: Model<ServiceAccount>,
              private readonly bcryptService: BcryptService) {
  }

  findAll(): Observable<ServiceAccountDTO[]> {
    return from(this.serviceAccountModel.find({}).exec()).pipe(
      map(serviceAccounts => serviceAccounts.map(service => ({
        name: service.name,
        clientID: service.clientID,
        owner: service.owner
      }))),
      map(serviceAccounts => sortBy(serviceAccounts, sa => sa.name))
    );
  }

  findByClientID(id: string): Observable<ServiceAccountDTO> {
    return from(this.serviceAccountModel.findOne({clientID: id}).exec()).pipe(
      map(serviceAccount => ({owner: serviceAccount.owner, clientID: serviceAccount.clientID, name: serviceAccount.name}))
    );
  }

  findByClientIDAndSecret(id: string, secret: string) {
    return from(this.serviceAccountModel.findOne({clientID: id}).exec()).pipe(
      filter(serviceAccount => !isNil(serviceAccount)),
      mergeMap(serviceAccount => this.bcryptService.compare(secret, serviceAccount.secret).pipe(
        map(valid => ({serviceAccount, valid}))
      )),
      filter(({serviceAccount, valid}) => valid),
      map(({serviceAccount}) => ({owner: serviceAccount.owner, clientID: serviceAccount.clientID, name: serviceAccount.name}))
    );
  }

  create(dto: CreateServiceAccountDTO, username: string): Observable<CreateServiceAccountResponse> {
    const clientID = uuid();
    const clientSecret = uuid();
    return this.bcryptService.encrypt(clientSecret).pipe(
      mergeMap(secret => this.createServiceAccount(username, dto, clientID, secret)),
      mapTo({clientID, secret: clientSecret})
    );
  }

  delete(id: string): Observable<{}> {
    return from(this.serviceAccountModel.deleteOne({clientID: id}).exec()).pipe(
      mapTo({})
    );
  }

  private createServiceAccount(username: string, dto: CreateServiceAccountDTO, clientID: string, secret: string) {
    return from(this.serviceAccountModel.create({owner: username, name: dto.name, clientID, secret})).pipe(
      catchError(err => {
        if (err.name === 'MongoError' && err.code === 11000) {
          throw new ConflictException(`Service account with name ${dto.name} already exists`);
        } else {
          throw err;
        }
      })
    );
  }
}
