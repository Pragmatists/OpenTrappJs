import * as request from 'supertest';
import { WorkLogController } from './work-log.controller';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Model } from 'mongoose';
import { WorkLog } from '../../work-log/work-log.model';
import MongoMemoryServer from 'mongodb-memory-server';
import { someWorkLog, testModuleWithInMemoryDb } from '../../utils/test-utils';
import { WorkLogModule } from '../../work-log/work-log.module';

const workLogEntries = [
  someWorkLog('2018/11/05', 'john.doe', 480, ['holidays'], undefined, 'id-to-remove'),
  someWorkLog('2018/12/05', 'james.bond', 480, ['projects', 'syniverse-dsp'])
];

describe('WorkLog Controller', () => {
  let app: INestApplication;
  let workLogModel: Model<WorkLog>;
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    const moduleWithDb = await testModuleWithInMemoryDb({
      imports: [WorkLogModule],
      controllers: [WorkLogController]
    });
    const module = moduleWithDb.module;
    mongoServer = moduleWithDb.mongoServer;
    workLogModel = module.get('WorkLogModel');

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await workLogModel.create(workLogEntries);
  });

  afterEach(async () => {
    await workLogModel.deleteMany({});
  });

  describe('DELETE /work-log/entries/:id', () => {
    it('should delete entry with given id', done => {
      const idToRemove = 'id-to-remove';

      request(app.getHttpServer())
        .delete(`/endpoints/v1/work-log/entries/${idToRemove}`)
        .expect(HttpStatus.NO_CONTENT)
        .then(async () => {
          const removedWorkLog = await workLogModel.findById({_id: idToRemove}).exec();
          expect(removedWorkLog).toBeNull();
          done();
        });
    });

    it('should return NOT FOUND if entry with id does not exist', done => {
      const idToRemove = 'not-existing-id';
      request(app.getHttpServer())
        .delete(`/endpoints/v1/work-log/entries/${idToRemove}`)
        .expect(HttpStatus.NOT_FOUND, done);
    });
  });
});
