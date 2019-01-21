import { v4 as uuid } from 'uuid';
import * as request from 'supertest';
import { INestApplication, ModuleMetadata } from '@nestjs/common/interfaces';
import { Test } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import MongoMemoryServer from 'mongodb-memory-server';
import { JWTPayload } from '../auth/auth.model';
import { sign } from 'jsonwebtoken';

export function someWorkLog(date: string,
                            employee: string,
                            workload: number,
                            tags: string[],
                            note?: string,
                            id = `WL.${uuid()}`) {
  return {
    _id: {
      _id: id
    },
    day: {
      date
    },
    employeeID: {
      _id: employee
    },
    projectNames: tags.map(t => ({name: t})),
    workload: {
      minutes: workload
    },
    note: {
      text: note
    },
    createdAt: new Date()
  };
}

export async function testModuleWithInMemoryDb(moduleMetadata: ModuleMetadata) {
  const mongoServer = new MongoMemoryServer();
  const uri = await mongoServer.getConnectionString();
  const module = await Test.createTestingModule({
    ...moduleMetadata,
    imports: [
      ...moduleMetadata.imports,
      MongooseModule.forRoot(uri, {useNewUrlParser: true})
    ]
  }).compile();
  return {
    module,
    mongoServer
  };
}

export function validJWTToken(payload: JWTPayload, expiresIn = 3600) {
  return sign(payload, 'test-secret', {expiresIn});
}

export function loggedInAs(email: string, displayName: string) {
  return validJWTToken({
    id: email,
    name: displayName,
    accountType: 'user',
    roles: ['USER'],
    provider: 'google',
    thirdPartyId: '123'
  });
}

export function getRequestWithValidToken(app: INestApplication, url: string) {
  const token = loggedInAs('john.doe@pragmatists.pl', 'John Doe');
  return request(app.getHttpServer())
    .get(url)
    .set('Authorization', `Bearer ${token}`);
}
