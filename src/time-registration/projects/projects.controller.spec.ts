import * as request from 'supertest';
import {ProjectsController} from './projects.controller';
import {someWorkLog, testModuleWithInMemoryDb} from '../../utils/test-utils';
import {INestApplication} from '@nestjs/common';
import {Model} from 'mongoose';
import {WorkLog} from '../../work-log/work-log.model';
import MongoMemoryServer from 'mongodb-memory-server';
import {WorkLogModule} from '../../work-log/work-log.module';

const workLogEntries = [
  someWorkLog('2019/01/05', 'john.doe', 480, ['holidays'], 'National holidays'),
  someWorkLog('2019/01/05', 'james.bond', 480, ['projects', 'syniverse-dsp']),
  someWorkLog('2019/01/06', 'james.bond', 480, ['projects', 'syniverse-dsp'])
];

describe('Projects Controller', () => {
  let app: INestApplication;
  let workLogModel: Model<WorkLog>;
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    const moduleWithDb = await testModuleWithInMemoryDb({
      imports: [WorkLogModule],
      controllers: [ProjectsController]
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

  it('GET /projects should return list of available projects', done => {
    return request(app.getHttpServer())
      .get('/endpoints/v1/projects')
      .expect(200)
      .expect(['holidays', 'projects', 'syniverse-dsp'], done);
  });
});
