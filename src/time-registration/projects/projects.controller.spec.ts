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
import { MongoMemoryServer } from 'mongodb-memory-server';
import { WorkLogModule } from '../../work-log/work-log.module';
import { includes } from 'lodash';
import { MockAuthModule } from '../../auth/mock-auth.module';
import { TagsService } from '../../work-log/tags.service';

function johnDoeWorkLog(date: string, tags: string[]) {
  return someWorkLog(date, 'john.doe', 480, tags);
}

const workLogEntries = [
  someWorkLog('2019/01/05', 'john.doe', 480, ['holidays']),
  someWorkLog('2019/01/05', 'james.bond', 480, ['projects', 'syniverse-dsp']),
  someWorkLog('2019/01/06', 'james.bond', 480, ['projects', 'syniverse-dsp']),
  someWorkLog('2019/01/11', 'tom.hanks', 480, ['projects', 'nvm']),
  johnDoeWorkLog('2019/01/30', ['vacation']),
  johnDoeWorkLog('2019/01/31', ['vacation']),
  johnDoeWorkLog('2019/02/01', ['projects', 'nvm']),
  johnDoeWorkLog('2019/02/02', ['projects', 'nvm']),
  johnDoeWorkLog('2019/02/02', ['internal', 'self-dev']),
  johnDoeWorkLog('2019/02/03', ['internal', 'self-dev', 'brown-bag']),
  johnDoeWorkLog('2019/02/04', ['internal', 'self-dev', 'brown-bag']),
  johnDoeWorkLog('2019/02/05', ['internal', 'self-dev']),
  johnDoeWorkLog('2019/02/06', ['vacation']),
  johnDoeWorkLog('2019/02/07', ['self-dev', 'internal']),
  johnDoeWorkLog('2019/02/02', ['nvm', 'projects']),
  johnDoeWorkLog('2019/02/08', ['holidays']),
  johnDoeWorkLog('2019/02/09', ['vacation']),
  johnDoeWorkLog('2019/02/10', ['vacation']),
];

describe('Projects Controller', () => {
  let app: INestApplication;
  let workLogModel: Model<WorkLog>;
  let mongoServer: MongoMemoryServer;
  let tagsService: TagsService;

  beforeAll(async () => {
    const moduleWithDb = await testModuleWithInMemoryDb({
      imports: [MockAuthModule, WorkLogModule],
      controllers: [ProjectsController]
    });
    const module = moduleWithDb.module;
    mongoServer = moduleWithDb.mongoServer;
    workLogModel = module.get('WorkLogModel');
    tagsService = module.get<TagsService>(TagsService);

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await workLogModel.insertMany(workLogEntries);
  });

  afterEach(async () => {
    await workLogModel.deleteMany({}).exec();
  });

  describe('GET /projects', () => {
    it('should return list of available projects', done => {
      return getRequestWithValidToken(app, 'projects')
          .expect(
              HttpStatus.OK,
              ['brown-bag', 'holidays', 'internal', 'nvm', 'projects', 'self-dev', 'syniverse-dsp', 'vacation'],
              done
          );
    });

    it('should return list of available projects from date', done => {
      return getRequestWithValidToken(app, 'projects?dateFrom=2019-02-08')
        .expect(
          HttpStatus.OK,
          ['holidays', 'vacation'],
          done
        );
    });

    it('should return UNAUTHORIZED for invalid token', done => {
      return getRequestWithInvalidToken(app, 'projects')
          .expect(HttpStatus.UNAUTHORIZED, done);
    });
  });

  describe('GET /projects/presets', () => {
    it('should return 2 most recent and 2 most often used presets by default', done => {
      jest.spyOn(tagsService as any, 'dateFrom', 'get')
          .mockReturnValue(new Date(2019, 0, 11));

      getRequestWithValidToken(app, 'projects/presets')
          .expect(HttpStatus.OK, [
            ['vacation'],
            ['holidays'],
            ['internal', 'self-dev'],
            ['nvm', 'projects']
          ], done);
    });

    it('should return 1 most recent and 1 most often used presets for limit set to 2', done => {
      jest.spyOn(tagsService as any, 'dateFrom', 'get')
        .mockReturnValue(new Date(2019, 0, 11));

      getRequestWithValidToken(app, 'projects/presets?limit=2')
        .expect(HttpStatus.OK, [
          ['vacation'],
          ['internal', 'self-dev']
        ], done);
    });

    it('should return 2 most recent and 1 most often used presets for limit set to 3', done => {
      jest.spyOn(tagsService as any, 'dateFrom', 'get')
        .mockReturnValue(new Date(2019, 0, 11));

      getRequestWithValidToken(app, 'projects/presets?limit=3')
        .expect(HttpStatus.OK, [
          ['vacation'],
          ['holidays'],
          ['internal', 'self-dev']
        ], done);
    });

    it('should return UNAUTHORIZED for invalid token', done => {
      return getRequestWithInvalidToken(app, 'projects/presets')
          .expect(HttpStatus.UNAUTHORIZED, done);
    });
  });

  describe('GET /projects/:projectName/work-log/entries', () => {
    it('should return entries for given project name', done => {
      const projectName = 'syniverse-dsp';

      return getRequestWithValidToken(app, `projects/${projectName}/work-log/entries`)
          .expect(HttpStatus.OK)
          .then(response => response.body)
          .then(entries => {
            expect(entries).toHaveLength(2);
            expect(entries.every(entry => includes(entry.projectNames, projectName))).toBeTruthy();
            done();
          });
    });

    it('should return empty list for unknown project name', done => {
      return getRequestWithValidToken(app, `projects/aaa/work-log/entries`)
          .expect(HttpStatus.OK, [], done);
    });

    it('should return UNAUTHORIZED for invalid token', done => {
      const projectName = 'syniverse-dsp';

      return getRequestWithInvalidToken(app, `projects/${projectName}/work-log/entries`)
          .expect(HttpStatus.UNAUTHORIZED, done);
    });
  });

});
