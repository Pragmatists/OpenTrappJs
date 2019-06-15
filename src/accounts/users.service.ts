import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { AuthorizedUser, AuthorizedUserDTO, CreateAuthorizedUserDTO } from './accounts.model';
import { from, Observable } from 'rxjs';
import { map, mapTo } from 'rxjs/operators';
import { pragmaEmailToUsername } from '../utils/email-utils';
import { sortBy } from 'lodash';

@Injectable()
export class UsersService {
  constructor(@InjectModel('AuthorizedUser') private readonly authorizedUserModel: Model<AuthorizedUser>) {
  }

  findAll(): Observable<AuthorizedUserDTO[]> {
    return from(this.authorizedUserModel.find({}).exec()).pipe(
      map(users => users.map(user => ({id: user.id, email: user.email, name: user.name, roles: user.roles}))),
      map(users => sortBy(users, user => user.email))
    );
  }

  findByName(name: string): Observable<AuthorizedUser> {
    return from(this.authorizedUserModel.findOne({name}).exec());
  }

  updateAuthorizedUser(dto: CreateAuthorizedUserDTO): Observable<{}> {
    const name = pragmaEmailToUsername(dto.email);
    if (dto.roles.length === 0) {
      return this.deleteOne(name);
    }
    return this.updateOne(name, dto).pipe(mapTo({}));
  }

  private updateOne(name: string, dto: CreateAuthorizedUserDTO): Observable<any> {
    return from(this.authorizedUserModel.updateOne(
      {name},
      {email: dto.email, name, roles: dto.roles},
      {upsert: true}
    ).exec());
  }

  private deleteOne(name: string): Observable<any> {
    return from(this.authorizedUserModel.deleteOne({name}).exec());
  }
}
