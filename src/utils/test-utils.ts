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
  return sign(payload.asPayload(), 'test-secret', {expiresIn});
}

export function loggedInAs(email: string, displayName: string, roles = ['USER']) {
  return validJWTToken(JWTPayload.userJWTPayload(
    displayName,
    email,
    roles,
    'google',
    '123'
  ));
}

export function getRequestWithValidToken(app: INestApplication, url: string, roles = ['USER']) {
  const token = loggedInAs('john.doe@pragmatists.pl', 'John Doe', roles);
  return request(app.getHttpServer())
    .get(url)
    .set('Authorization', `Bearer ${token}`);
}

export function getRequestWithInvalidToken(app: INestApplication, url: string) {
  return request(app.getHttpServer())
    .get(url)
    .set('Authorization', 'Bearer invalid-token');
}

export function postRequestWithValidToken(app: INestApplication,
                                          url: string,
                                          body,
                                          tokenEmail = 'john.doe@pragmatists.pl',
                                          tokenDisplayName = 'John Doe') {
  const token = loggedInAs(tokenEmail, tokenDisplayName);
  return request(app.getHttpServer())
    .post(url)
    .send(body)
    .set('Authorization', `Bearer ${token}`);
}

export function postRequestWithRoles(app: INestApplication,
                                     url: string,
                                     body,
                                     roles: string[]) {
  const token = loggedInAs('john.doe@pragmatists.pl', 'John Doe', roles);
  return request(app.getHttpServer())
    .post(url)
    .send(body)
    .set('Authorization', `Bearer ${token}`);
}

export function postRequestWithInvalidToken(app: INestApplication, url: string, body) {
  return request(app.getHttpServer())
    .post(url)
    .send(body)
    .set('Authorization', `Bearer invalid-token`);
}

export function putRequestWithValidToken(app: INestApplication,
                                         url: string,
                                         body,
                                         tokenEmail = 'john.doe@pragmatists.pl',
                                         tokenDisplayName = 'John Doe') {
  const token = loggedInAs(tokenEmail, tokenDisplayName);
  return request(app.getHttpServer())
      .put(url)
      .send(body)
      .set('Authorization', `Bearer ${token}`);
}

export function putRequestWithInvalidToken(app: INestApplication, url: string, body) {
  return request(app.getHttpServer())
      .put(url)
      .send(body)
      .set('Authorization', `Bearer invalid-token`);
}

export function deleteRequestWithValidToken(app: INestApplication,
                                            url: string,
                                            tokenEmail = 'john.doe@pragmatists.pl',
                                            tokenDisplayName = 'John Doe') {
  const token = loggedInAs(tokenEmail, tokenDisplayName);
  return request(app.getHttpServer())
    .delete(url)
    .set('Authorization', `Bearer ${token}`);
}

export function deleteRequestWithInvalidToken(app: INestApplication, url: string) {
  return request(app.getHttpServer())
    .delete(url)
    .set('Authorization', 'Bearer invalid-token');
}

export function deleteRequestWithRoles(app: INestApplication,
                                       url: string,
                                       roles: string[],
                                       tokenEmail = 'john.doe@pragmatists.pl') {
  const token = loggedInAs(tokenEmail, 'John Doe', roles);
  return request(app.getHttpServer())
    .delete(url)
    .set('Authorization', `Bearer ${token}`);
}
