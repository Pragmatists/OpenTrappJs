import { ProjectsController } from './projects.controller';
import {
  getRequestWithInvalidToken,
  getRequestWithValidToken,
  someWorkLog,
  testModuleWithInMemoryDb
} from '../../utils/test-utils';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Model } from 'mongoose';
import { WorkLog } from '../../work-log/work-log.model';
import MongoMemoryServer from 'mongodb-memory-server';
import { WorkLogModule } from '../../work-log/work-log.module';
import { includes } from 'lodash';
import { MockAuthModule } from '../../auth/mock-auth.module';

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
      imports: [MockAuthModule, WorkLogModule],
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
    await workLogModel.deleteMany({}).exec();
  });

  describe('GET /projects', () => {
    it('should return list of available projects', done => {
      return getRequestWithValidToken(app, '/projects')
        .expect(HttpStatus.OK)
        .expect(['holidays', 'nvm', 'projects', 'syniverse-dsp'], done);
    });

    it('should return UNAUTHORIZED for invalid token', done => {
      return getRequestWithInvalidToken(app, '/projects')
        .expect(HttpStatus.UNAUTHORIZED, done);
    });
  });

  describe('GET /projects/:projectName/work-log/entries', () => {
    it('should return entries for given project name', done => {
      const projectName = 'syniverse-dsp';

      return getRequestWithValidToken(app, `/projects/${projectName}/work-log/entries`)
        .expect(HttpStatus.OK)
        .then(response => response.body.items)
        .then(entries => {
          expect(entries).toHaveLength(2);
          expect(entries.every(entry => includes(entry.projectNames, projectName))).toBeTruthy();
          done();
        });
    });

    it('should return empty list for unknown project name', done => {
      return getRequestWithValidToken(app, `/projects/aaa/work-log/entries`)
        .expect(HttpStatus.OK, {items: []}, done);
    });

    it('should return UNAUTHORIZED for invalid token', done => {
      const projectName = 'syniverse-dsp';

      return getRequestWithInvalidToken(app, `/projects/${projectName}/work-log/entries`)
        .expect(HttpStatus.UNAUTHORIZED, done);
    });
  });

});
