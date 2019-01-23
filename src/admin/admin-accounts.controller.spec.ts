import { AdminAccountsController } from './admin-accounts.controller';
import { INestApplication } from '@nestjs/common';
import MongoMemoryServer from 'mongodb-memory-server';
import { testModuleWithInMemoryDb } from '../utils/test-utils';
import { MockAuthModule } from '../auth/mock-auth.module';

describe('AdminAccounts Controller', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    const moduleWithDb = await testModuleWithInMemoryDb({
      imports: [MockAuthModule],
      controllers: [AdminAccountsController]
    });
    const module = moduleWithDb.module;
    mongoServer = moduleWithDb.mongoServer;

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // TODO
  });

  afterEach(async () => {
    // TODO
  });

  describe('GET /service-accounts', () => {
    it('should list all service accounts', done => {
      done(); // TODO
    });
  });
});
