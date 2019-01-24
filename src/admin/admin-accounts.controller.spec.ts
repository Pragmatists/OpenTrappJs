import { AdminAccountsController } from './admin-accounts.controller';
import { HttpStatus, INestApplication } from '@nestjs/common';
import MongoMemoryServer from 'mongodb-memory-server';
import {
  getRequestWithInvalidToken,
  getRequestWithValidToken,
  postRequestWithInvalidToken,
  postRequestWithRoles,
  testModuleWithInMemoryDb
} from '../utils/test-utils';
import { MockAuthModule } from '../auth/mock-auth.module';
import { Model } from 'mongoose';
import { AuthorizedUser, AuthorizedUserDTO, ServiceAccount, ServiceAccountDTO } from '../accounts/accounts.model';
import { AccountsModule } from '../accounts/accounts.module';
import { SharedModule } from '../shared/shared.module';
import { compare } from 'bcrypt';

const authorizedUsers = [
  {email: 'andy.barber@pragmatists.pl', name: 'andy.barber', roles: ['USER', 'ADMIN']},
  {email: 'tom.black@pragmatists.com', name: 'tom.black', roles: ['ADMIN']}
];

const serviceAccounts = [
  {clientID: 'sa-id-1', secret: 'sa-secret-1', name: 'Service account 1', owner: 'andy.barber'},
  {clientID: 'sa-id-2', secret: 'sa-secret-1', name: 'Service account 2', owner: 'tom.black'}
];

describe('AdminAccounts Controller', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;
  let authorizedUserModel: Model<AuthorizedUser>;
  let serviceAccountModel: Model<ServiceAccount>;

  beforeAll(async () => {
    const moduleWithDb = await testModuleWithInMemoryDb({
      imports: [MockAuthModule, AccountsModule, SharedModule],
      controllers: [AdminAccountsController]
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

  beforeEach(async () => {
    await authorizedUserModel.create(authorizedUsers);
    await serviceAccountModel.create(serviceAccounts);
  });

  afterEach(async () => {
    await authorizedUserModel.deleteMany({}).exec();
    await serviceAccountModel.deleteMany({}).exec();
  });

  describe('GET /service-accounts', () => {
    it('should list all service accounts', done => {
      return getRequestWithValidToken(app, '/api/v1/admin/service-accounts', ['ADMIN'])
        .expect(HttpStatus.OK)
        .then(response => {
          const services: ServiceAccountDTO[] = response.body;
          expect(services).toHaveLength(2);
          expect(services[0]).toMatchObject(serviceAccounts[0]);
          expect(services[1]).toMatchObject(serviceAccounts[1]);
          done();
        });
    });

    it('should return UNAUTHORIZED for invalid token', done => {
      return getRequestWithInvalidToken(app, '/api/v1/admin/service-accounts')
        .expect(HttpStatus.UNAUTHORIZED, done);
    });

    it('should return FORBIDDEN for token without ADMIN role', done => {
      return getRequestWithValidToken(app, '/api/v1/admin/service-accounts')
        .expect(HttpStatus.FORBIDDEN, done);
    });
  });

  describe('POST /service-accounts', () => {
    it('should create new service account', done => {
      const requestBody = {name: 'Service account 3'};

      return postRequestWithRoles(app, '/api/v1/admin/service-accounts', requestBody, ['ADMIN'])
        .expect(HttpStatus.CREATED)
        .then(async response => {
          expect(response.body.clientID).toBeDefined();
          expect(response.body.secret).toBeDefined();
          const createdAccount = await serviceAccountModel.findOne({name: requestBody.name}).exec();
          expect(createdAccount.clientID).toBeDefined();
          expect(createdAccount.secret).toBeDefined();
          expect(createdAccount.owner).toEqual('john.doe');
          expect(createdAccount.name).toEqual(requestBody.name);
          const secretsEqual = await compare(response.body.secret, createdAccount.secret);
          expect(secretsEqual).toBeTruthy();
          done();
        });
    });

    it('shoud return CONFLICT for duplicated name', done => {
      const requestBody = {name: 'Service account 2'};

      return postRequestWithRoles(app, '/api/v1/admin/service-accounts', requestBody, ['ADMIN'])
        .expect(HttpStatus.CONFLICT, done);
    });

    it('should return UNAUTHORIZED for invalid token', done => {
      const requestBody = {name: 'Service account 3'};

      return postRequestWithInvalidToken(app, '/api/v1/admin/service-accounts', requestBody)
        .expect(HttpStatus.UNAUTHORIZED, done);
    });

    it('should return FORBIDDEN for token without ADMIN role', done => {
      const requestBody = {name: 'Service account 3'};

      return postRequestWithRoles(app, '/api/v1/admin/service-accounts', requestBody, ['USER'])
        .expect(HttpStatus.FORBIDDEN, done);
    });
  });

  describe('GET /authorized-users', () => {
    it('should return all users with custom privileges', done => {
      return getRequestWithValidToken(app, '/api/v1/admin/authorized-users', ['ADMIN'])
        .expect(HttpStatus.OK)
        .then(response => {
          const users: AuthorizedUserDTO[] = response.body;
          expect(users).toHaveLength(2);
          expect(users[0]).toMatchObject(authorizedUsers[0]);
          expect(users[1]).toMatchObject(authorizedUsers[1]);
          done();
        });
    });

    it('should return UNAUTHORIZED for invalid token', done => {
      getRequestWithInvalidToken(app, '/api/v1/admin/authorized-users')
        .expect(HttpStatus.UNAUTHORIZED, done);
    });

    it('should return FORBIDDEN for token without ADMIN role', done => {
      getRequestWithValidToken(app, '/api/v1/admin/authorized-users', ['EXTERNAL_SERVICE'])
        .expect(HttpStatus.FORBIDDEN, done);
    });
  });

  describe('POST /authorized-users', () => {
    it('should create authorized user with roles if provided name does not exist', done => {
      const requestBody = {email: 'new.user@pragmatists.com', roles: ['ADMIN']};

      return postRequestWithRoles(app, '/api/v1/admin/authorized-users', requestBody, ['ADMIN'])
        .expect(HttpStatus.OK)
        .then(async () => {
          const createdUser = await authorizedUserModel.findOne({name: 'new.user'}).exec();
          expect(createdUser.email).toEqual('new.user@pragmatists.com');
          expect(createdUser.roles.map(r => r)).toEqual(['ADMIN']);
          done();
        });
    });

    it('should update authorized user if provided name already exist', done => {
      const requestBody = {email: 'andy.barber@pragmatists.pl', roles: ['NEW-ROLE']};

      return postRequestWithRoles(app, '/api/v1/admin/authorized-users', requestBody, ['ADMIN'])
        .expect(HttpStatus.OK)
        .then(async () => {
          const allUsersCount = await authorizedUserModel.countDocuments({}).exec();
          expect(allUsersCount).toEqual(2);
          const createdUser = await authorizedUserModel.findOne({name: 'andy.barber'}).exec();
          expect(createdUser.email).toEqual('andy.barber@pragmatists.pl');
          expect(createdUser.roles.map(r => r)).toEqual(['NEW-ROLE']);
          done();
        });
    });

    it('should remove authorized user if roles list is empty', done => {
      const requestBody = {email: 'andy.barber@pragmatists.pl', roles: []};

      return postRequestWithRoles(app, '/api/v1/admin/authorized-users', requestBody, ['ADMIN'])
        .expect(HttpStatus.OK)
        .then(async () => {
          const allUsersCount = await authorizedUserModel.countDocuments({}).exec();
          expect(allUsersCount).toEqual(1);
          const createdUser = await authorizedUserModel.findOne({name: 'andy.barber'}).exec();
          expect(createdUser).toBeNull();
          done();
        });
    });

    it('should return UNAUTHORIZED for invalid token', done => {
      const requestBody = {email: 'new.user@pragmatists.com', roles: ['ADMIN']};

      return postRequestWithInvalidToken(app, '/api/v1/admin/authorized-users', requestBody)
        .expect(HttpStatus.UNAUTHORIZED, done);
    });

    it('should return FORBIDDEN for token without ADMIN role', done => {
      const requestBody = {email: 'new.user@pragmatists.com', roles: ['ADMIN']};

      return postRequestWithRoles(app, '/api/v1/admin/authorized-users', requestBody, ['EXTERNAL_SERVICE'])
        .expect(HttpStatus.FORBIDDEN, done);
    });

    it('should return BAD REQUEST for invalid email', done => {
      const requestBody = {email: 'invalid-email', roles: ['ADMIN']};

      return postRequestWithRoles(app, '/api/v1/admin/authorized-users', requestBody, ['ADMIN'])
        .expect(HttpStatus.BAD_REQUEST, done);
    });
  });
});
