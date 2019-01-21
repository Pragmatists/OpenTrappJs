import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { MockJWTStrategy } from './mock-auth.module';
import { loggedInAs } from '../utils/test-utils';

describe('Auth Controller', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [MockJWTStrategy]
    }).compile();
    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /status', () => {
    it('should return UNAUTHORIZED if token is not present', done => {
      request(app.getHttpServer())
        .get('/api/v1/authentication/status')
        .expect(HttpStatus.UNAUTHORIZED, done);
    });

    it('should return user details for authorized user', done => {
      const token = loggedInAs('homer.simpson@pragmatists.com', 'Homer Simpson');

      authorizedGetRequest('/api/v1/authentication/status', token)
        .expect(200)
        .then(response => {
          const {email, name, displayName, roles, accountType, loginUrl} = response.body;
          expect(email).toEqual('homer.simpson@pragmatists.com');
          expect(name).toEqual('homer.simpson');
          expect(displayName).toEqual('Homer Simpson');
          expect(roles).toEqual(['USER']);
          expect(accountType).toEqual('user');
          expect(loginUrl).toEqual('/api/v1/authentication/login');
          done();
        });
    });
  });

  function authorizedGetRequest(url: string, token: string) {
    return request(app.getHttpServer())
      .get(url)
      .set('Authorization', `Bearer ${token}`);
  }
});
