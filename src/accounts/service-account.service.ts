import { ConflictException, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { CreateServiceAccountDTO, CreateServiceAccountResponse, ServiceAccount, ServiceAccountDTO } from './accounts.model';
import { InjectModel } from '@nestjs/mongoose';
import { from, Observable } from 'rxjs';
import { catchError, flatMap, map, mapTo } from 'rxjs/operators';
import { v4 as uuid } from 'uuid';
import { BcryptService } from '../shared/bcrypt.service';

@Injectable()
export class ServiceAccountService {

  constructor(@InjectModel('ServiceAccount') private readonly serviceAccountModel: Model<ServiceAccount>,
              private readonly bcryptService: BcryptService) {
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

  create(dto: CreateServiceAccountDTO, username: string): Observable<CreateServiceAccountResponse> {
    const clientID = uuid();
    const clientSecret = uuid();
    return this.bcryptService.encrypt(clientSecret).pipe(
      flatMap(secret => this.createServiceAccount(username, dto, clientID, secret)),
      mapTo({clientID, secret: clientSecret})
    );
  }

  private createServiceAccount(username: string, dto: CreateServiceAccountDTO, clientID: string, secret: string) {
    return from(this.serviceAccountModel.create({
      owner: username,
      name: dto.name,
      clientID,
      secret
    })).pipe(
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
