import * as request from 'supertest';
import { ProjectsController } from './projects.controller';
import { someWorkLog, testModuleWithInMemoryDb } from '../../utils/test-utils';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Model } from 'mongoose';
import { WorkLog } from '../../work-log/work-log.model';
import MongoMemoryServer from 'mongodb-memory-server';
import { WorkLogModule } from '../../work-log/work-log.module';
import { includes } from 'lodash';

const workLogEntries = [
  someWorkLog('2019/01/05', 'john.doe', 480, ['holidays']),
  someWorkLog('2019/01/05', 'james.bond', 480, ['projects', 'syniverse-dsp']),
  someWorkLog('2019/01/06', 'james.bond', 480, ['projects', 'syniverse-dsp']),
  someWorkLog('2019/01/11', 'tom.hanks', 480, ['projects', 'nvm'])
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

  describe('GET /projects', () => {
    it('should return list of available projects', done => {
      return request(app.getHttpServer())
        .get('/endpoints/v1/projects')
        .expect(HttpStatus.OK)
        .expect(['holidays', 'nvm', 'projects', 'syniverse-dsp'], done);
    });
  });

  describe('GET /projects/:projectName/work-log/entries', () => {
    it('should return entries for given project name', done => {
      const projectName = 'syniverse-dsp';

      return request(app.getHttpServer())
        .get(`/endpoints/v1/projects/${projectName}/work-log/entries`)
        .expect(HttpStatus.OK)
        .then(response => response.body.items)
        .then(entries => {
          expect(entries).toHaveLength(2);
          expect(entries.every(entry => includes(entry.projectNames, projectName))).toBeTruthy();
          done();
        });
    });

    it('should return empty list for unknown project name', done => {
      return request(app.getHttpServer())
        .get(`/endpoints/v1/projects/aaa/work-log/entries`)
        .expect(HttpStatus.OK, {items: []}, done);
    });
  });

});
