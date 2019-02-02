import * as request from 'supertest';
import { AuthController } from './auth.controller';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { MockGoogleClient, MockJWTStrategy } from './mock-auth.module';
import { loggedInAs, postRequestWithRoles, testModuleWithInMemoryDb, validJWTToken } from '../utils/test-utils';
import { AccountsModule } from '../accounts/accounts.module';
import MongoMemoryServer from 'mongodb-memory-server';
import { Model } from 'mongoose';
import { AuthorizedUser, ServiceAccount } from '../accounts/accounts.model';
import { AuthService } from './auth.service';
import { AdminAccountsController } from '../admin/admin-accounts.controller';
import { JWTPayload } from './auth.model';
import { GoogleClient } from './google-client';

describe('Auth Controller', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;
  let serviceAccountModel: Model<ServiceAccount>;
  let authorizedUserModel: Model<AuthorizedUser>;

  beforeAll(async () => {
    const moduleWithDb = await testModuleWithInMemoryDb({
      imports: [AccountsModule],
      controllers: [AuthController, AdminAccountsController],
      providers: [MockJWTStrategy, AuthService, {provide: GoogleClient, useClass: MockGoogleClient}]
    });
    const module = moduleWithDb.module;
    mongoServer = moduleWithDb.mongoServer;

    authorizedUserModel = module.get('AuthorizedUserModel');
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

  describe('POST /service-token', () => {
    it('should return token for existing service account', done => {
      return someServiceAccount()
        .then(({clientID, secret}) =>
          request(app.getHttpServer())
            .post('/api/v1/authentication/service-token')
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
            .post('/api/v1/authentication/service-token')
            .send({clientID: 'invalid-id', secret})
            .expect(HttpStatus.UNAUTHORIZED)
            .then(() => done())
        );
    });

    it('should return UNAUTHORIZED for invalid secret', done => {
      return someServiceAccount()
        .then(({clientID}) =>
          request(app.getHttpServer())
            .post('/api/v1/authentication/service-token')
            .send({clientID, secret: 'invalid-secret'})
            .expect(HttpStatus.UNAUTHORIZED)
            .then(() => done())
        );
    });

    it('should return BAD REQUEST for invalid body', done => {
      return someServiceAccount()
        .then(({clientID, secret}) =>
          request(app.getHttpServer())
            .post('/api/v1/authentication/service-token')
            .send({clientID2: clientID, secret2: secret})
            .expect(HttpStatus.BAD_REQUEST)
            .then(() => done())
        );
    });
  });

  describe('GET /user-token', () => {
    beforeEach(async () => {
      await authorizedUserModel.create({email: 'john.doe@pragmatists.pl', name: 'john.doe', roles: ['ADMIN']});
    });

    afterEach(async () => {
      await authorizedUserModel.deleteMany({}).exec();
    });

    it('should return user details and token for valid Google ID token', done => {
      request(app.getHttpServer())
        .get('/api/v1/authentication/user-token')
        .set('id-token', 'valid.google.token')
        .expect(HttpStatus.OK)
        .then(response => {
          expect(response.body.token).toBeDefined();
          expect(response.body.displayName).toEqual('John Doe');
          expect(response.body.name).toEqual('john.doe');
          expect(response.body.email).toEqual('john.doe@pragmatists.pl');
          expect(response.body.profilePicture).toEqual('http://user-profile.pl/johndoe/picture');
          expect(response.body.roles).toEqual(['USER', 'ADMIN']);
          done();
        });
    });

    it('should return UNAUTHORIZED if token header is not present', done => {
      request(app.getHttpServer())
        .get('/api/v1/authentication/user-token')
        .expect(HttpStatus.UNAUTHORIZED, done);
    });

    it('should return UNAUTHORIZED if provided ID token is invalid', done => {
      request(app.getHttpServer())
        .get('/api/v1/authentication/user-token')
        .set('id-token', 'invalid-token')
        .expect(HttpStatus.UNAUTHORIZED, done);
    });
  });

  function authorizedGetRequest(url: string, token: string) {
    return request(app.getHttpServer())
      .get(url)
      .set('Authorization', `Bearer ${token}`);
  }

  function someServiceAccount(serviceAccountName = 'Service account'): Promise<{ clientID: string, secret: string }> {
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
