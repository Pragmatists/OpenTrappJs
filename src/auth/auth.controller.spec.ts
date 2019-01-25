import * as request from 'supertest';
import { AuthController } from './auth.controller';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { MockJWTStrategy } from './mock-auth.module';
import { loggedInAs, postRequestWithRoles, testModuleWithInMemoryDb, validJWTToken } from '../utils/test-utils';
import { AccountsModule } from '../accounts/accounts.module';
import MongoMemoryServer from 'mongodb-memory-server';
import { Model } from 'mongoose';
import { ServiceAccount } from '../accounts/accounts.model';
import { AuthService } from './auth.service';
import { AdminAccountsController } from '../admin/admin-accounts.controller';
import { JWTPayload } from './auth.model';

describe('Auth Controller', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;
  let serviceAccountModel: Model<ServiceAccount>;

  beforeAll(async () => {
    const moduleWithDb = await testModuleWithInMemoryDb({
      imports: [AccountsModule],
      controllers: [AuthController, AdminAccountsController],
      providers: [MockJWTStrategy, AuthService]
    });
    const module = moduleWithDb.module;
    mongoServer = moduleWithDb.mongoServer;

    serviceAccountModel = module.get('ServiceAccountModel');
    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await serviceAccountModel.deleteMany({}).exec();
  });

  describe('GET /status', () => {
    it('should return UNAUTHORIZED if token is not present', done => {
      return request(app.getHttpServer())
        .get('/api/v1/authentication/status')
        .expect(HttpStatus.UNAUTHORIZED, done);
    });

    it('should return user details for authorized user', done => {
      const token = loggedInAs('homer.simpson@pragmatists.com', 'Homer Simpson');

      return authorizedGetRequest('/api/v1/authentication/status', token)
        .expect(HttpStatus.OK)
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

    it('should return details for service account', done => {
      return serviceAccountToken('Awesome account')
        .then(({token, clientID}) => {
          return authorizedGetRequest('/api/v1/authentication/status', token)
            .expect(HttpStatus.OK)
            .then(response => {
              const {email, name, displayName, roles, accountType, loginUrl} = response.body;
              expect(email).toBeUndefined();
              expect(name).toEqual(clientID);
              expect(displayName).toEqual('Awesome account');
              expect(roles).toEqual(['EXTERNAL_SERVICE']);
              expect(accountType).toEqual('service');
              expect(loginUrl).toEqual('/api/v1/authentication/login');
              done();
            });
        });
    });
  });

  describe('POST /token', () => {
    it('should return token for existing service account', done => {
      return someServiceAccount()
        .then(({clientID, secret}) =>
          request(app.getHttpServer())
            .post('/api/v1/authentication/token')
            .send({clientID, secret})
            .expect(HttpStatus.OK)
            .then(tokenResponse => {
              expect(tokenResponse.body.token).toBeDefined();
              done();
            })
        );
    });

    it('should return UNAUTHORIZED for invalid clientID', done => {
      return someServiceAccount()
        .then(({secret}) =>
          request(app.getHttpServer())
            .post('/api/v1/authentication/token')
            .send({clientID: 'invalid-id', secret})
            .expect(HttpStatus.UNAUTHORIZED)
            .then(() => done())
        );
    });

    it('should return UNAUTHORIZED for invalid secret', done => {
      return someServiceAccount()
        .then(({clientID}) =>
          request(app.getHttpServer())
            .post('/api/v1/authentication/token')
            .send({clientID, secret: 'invalid-secret'})
            .expect(HttpStatus.UNAUTHORIZED)
            .then(() => done())
        );
    });

    it('should return BAD REQUEST for invalid body', done => {
      return someServiceAccount()
        .then(({clientID, secret}) =>
          request(app.getHttpServer())
            .post('/api/v1/authentication/token')
            .send({clientID2: clientID, secret2: secret})
            .expect(HttpStatus.BAD_REQUEST)
            .then(() => done())
        );
    });
  });

  function authorizedGetRequest(url: string, token: string) {
    return request(app.getHttpServer())
      .get(url)
      .set('Authorization', `Bearer ${token}`);
  }

  function someServiceAccount(serviceAccountName = 'Service account'): Promise<{clientID: string, secret: string}> {
    const createServiceAccountRequestBody = {name: serviceAccountName};
    return postRequestWithRoles(app, '/api/v1/admin/service-accounts', createServiceAccountRequestBody, ['ADMIN'])
      .then(createServiceAccountResponse => createServiceAccountResponse.body);
  }

  function serviceAccountToken(serviceAccountName = 'Service account') {
    return someServiceAccount(serviceAccountName)
      .then(({clientID}) => ({
        token: validJWTToken(JWTPayload.serviceJWTPayload(serviceAccountName, clientID, ['EXTERNAL_SERVICE'])),
        clientID
      }));
  }
});
