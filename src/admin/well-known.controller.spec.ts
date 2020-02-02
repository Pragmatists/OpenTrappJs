import { loggedInAs, testModuleWithInMemoryDb } from '../utils/test-utils';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { MockAuthModule } from '../auth/mock-auth.module';
import { WellKnownController } from './well-known.controller';
import * as request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';

describe('WellKnownController', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    const moduleWithDb = await testModuleWithInMemoryDb({
      imports: [MockAuthModule],
      controllers: [WellKnownController]
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

  it('admin can set challenge', async done => {
    const token = loggedInAs('john.doe@pragmatists.pl', 'John Doe', ['ADMIN']);
    await request(app.getHttpServer())
      .put('/.well-known/acme-challenge/some-key')
      .send({secret: 'secret'})
      .set('Authorization', `Bearer ${token}`)
      .expect(200, {});

    request(app.getHttpServer())
      .get('/.well-known/acme-challenge/some-key')
      .expect(200, 'secret', done);
  });

  it('should return FORBIDDEN if token has neither ADMIN nor EXTERNAL_SERVICE role', done => {
    const token = loggedInAs('john.doe@pragmatists.pl', 'John Doe', ['USER']);
    request(app.getHttpServer())
      .put('/.well-known/acme-challenge/some-key')
      .send({secret: 'secret'})
      .set('Authorization', `Bearer ${token}`)
      .expect(HttpStatus.FORBIDDEN, done);
  });

  it('should return NOT FOUND if secret is not set', done => {
    request(app.getHttpServer())
      .get('/.well-known/acme-challenge/unexpected-key')
      .expect(404, {statusCode: 404, error: 'Not Found', message: 'Secret is not set'}, done);
  });
});
