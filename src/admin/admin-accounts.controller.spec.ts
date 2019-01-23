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
import { AuthorizedUser, AuthorizedUserDTO } from '../accounts/accounts.model';
import { AccountsModule } from '../accounts/accounts.module';

const authorizedUsers = [
  {email: 'andy.barber@pragmatists.pl', name: 'andy.barber', roles: ['USER', 'ADMIN']},
  {email: 'tom.black@pragmatists.com', name: 'tom.black', roles: ['ADMIN']}
];

describe('AdminAccounts Controller', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;
  let authorizedUserModel: Model<AuthorizedUser>;

  beforeAll(async () => {
    const moduleWithDb = await testModuleWithInMemoryDb({
      imports: [MockAuthModule, AccountsModule],
      controllers: [AdminAccountsController]
    });
    const module = moduleWithDb.module;
    mongoServer = moduleWithDb.mongoServer;

    authorizedUserModel = module.get('AuthorizedUserModel');
    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await authorizedUserModel.create(authorizedUsers);
  });

  afterEach(async () => {
    await authorizedUserModel.deleteMany({}).exec();
  });

  describe('GET /service-accounts', () => {
    it('should list all service accounts', done => {
      getRequestWithValidToken(app, '/api/v1/admin/service-accounts')
        .expect(404, done); // TODO
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
