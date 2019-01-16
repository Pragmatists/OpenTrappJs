import * as request from 'supertest';
import {Test} from '@nestjs/testing';
import {AuthController} from './auth.controller';
import {INestApplication} from '@nestjs/common';
import {AuthService} from './auth.service';

describe('Auth Controller', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService]
    }).compile();
    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /status', () => {
    it('should return ANONYMOUS data for unauthorized user', done => {
      request(app.getHttpServer())
        .get('/endpoints/v1/authentication/status')
        .expect(200, {
            username: 'Anonymous',
            displayName: 'Anonymous',
            authenticated: false,
            loginUrl: '/endpoints/v1/authentication/login',
            logoutUrl: '/endpoints/v1/authentication/logout'
          },
          done
        );
    });

    it('should return user details for authorized user', done => {
      loggedInAs('homer.simpson@springfield.com', 'Homer Simpson');

      request(app.getHttpServer())
        .get('/endpoints/v1/authentication/status')
        .expect(200, {
            username: 'homer.simpson',
            displayName: 'Homer Simpson',
            authenticated: true,
            loginUrl: '/endpoints/v1/authentication/login',
            logoutUrl: '/endpoints/v1/authentication/logout'
          },
          done
        );
    });
  });

  function loggedInAs(username: string, displayName: string) {

  }
});
