import { AdminWorkLogController } from './admin-work-log.controller';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { MockAuthModule } from '../auth/mock-auth.module';
import { WorkLogModule } from '../work-log/work-log.module';
import { Model } from 'mongoose';
import { WorkLog, WorkLogDTO } from '../work-log/work-log.model';
import {
  getRequestWithValidToken,
  postRequestWithRoles,
  someWorkLog,
  testModuleWithInMemoryDb
} from '../utils/test-utils';
import { MongoMemoryServer } from 'mongodb-memory-server';

const workLogEntries = [
  someWorkLog('2019/01/05', 'john.doe', 480, ['holidays'], 'National holidays'),
  someWorkLog('2019/01/05', 'james.bond', 480, ['projects', 'syniverse-dsp']),
  someWorkLog('2019/01/06', 'james.bond', 480, ['projects', 'nvm']),
  someWorkLog('2019/01/07', 'john.doe', 480, ['projects', 'nvm']),
  someWorkLog('2019/01/08', 'john.doe', 480, ['projects', 'syniverse-dsp'])
];

describe('AdminWorkLogController', () => {
  let app: INestApplication;
  let workLogModel: Model<WorkLog>;
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    const moduleWithDb = await testModuleWithInMemoryDb({
      imports: [MockAuthModule, WorkLogModule],
      controllers: [AdminWorkLogController]
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

  describe('GET /tags', () => {
    it('should return list of available tags', done => {
      return getRequestWithValidToken(app, '/admin/tags', ['ADMIN'])
        .expect(HttpStatus.OK)
        .expect(['holidays', 'nvm', 'projects', 'syniverse-dsp'], done);
    });

    it('should allow service account to fetch data', done => {
      return getRequestWithValidToken(app, '/admin/tags', ['EXTERNAL_SERVICE'])
        .expect(HttpStatus.OK, done);
    });

    it('should return FORBIDDEN if token has neither ADMIN nor EXTERNAL_SERVICE role', done => {
      return getRequestWithValidToken(app, '/admin/tags', ['USER'])
        .expect(HttpStatus.FORBIDDEN, done);
    });
  });

  describe('GET /work-log/entries', () => {
    it('should return complete list of entries if neither user nor date is specified', done => {
      return getRequestWithValidToken(app, '/admin/work-log/entries', ['ADMIN'])
        .expect(HttpStatus.OK)
        .then(response => {
          const workLogs: WorkLogDTO[] = response.body;
          return workLogs.sort(reverseSortByEmployee);
        })
        .then(workLogs => {
          expect(workLogs).toHaveLength(5);
          expect(workLogs[0]).toEqual(jasmine.objectContaining({
            day: '2019/01/05',
            employeeID: 'john.doe',
            note: 'National holidays',
            projectNames: ['holidays'],
            workload: 480
          }));
          done();
        });
    });

    it('should return entries for user', done => {
      return getRequestWithValidToken(app, '/admin/work-log/entries?user=john.doe', ['ADMIN'])
        .expect(HttpStatus.OK)
        .then(response => {
          const workLogs = response.body;
          expect(workLogs).toHaveLength(3);
          expect(workLogs[0].employeeID).toEqual('john.doe');
          expect(workLogs[1].employeeID).toEqual('john.doe');
          expect(workLogs[2].employeeID).toEqual('john.doe');
          done();
        });
    });

    it('should return entries for date', done => {
      return getRequestWithValidToken(app, '/admin/work-log/entries?date=2019-01-05', ['ADMIN'])
        .expect(HttpStatus.OK)
        .then(response => {
          const workLogs = response.body;
          expect(workLogs).toHaveLength(2);
          expect(workLogs[0].day).toEqual('2019/01/05');
          expect(workLogs[1].day).toEqual('2019/01/05');
          done();
        });
    });

    it('should return entries for dates range', done => {
      return getRequestWithValidToken(app, '/admin/work-log/entries?dateFrom=2019-01-06&dateTo=2019-01-07', ['ADMIN'])
        .expect(HttpStatus.OK)
        .then(response => {
          const workLogs = response.body;
          expect(workLogs).toHaveLength(2);
          expect(workLogs[0].day).toEqual('2019/01/06');
          expect(workLogs[1].day).toEqual('2019/01/07');
          done();
        });
    });

    it('should return entries after date', done => {
      return getRequestWithValidToken(app, '/admin/work-log/entries?dateFrom=2019-01-07', ['ADMIN'])
        .expect(HttpStatus.OK)
        .then(response => {
          const workLogs = response.body;
          expect(workLogs).toHaveLength(2);
          expect(workLogs[0].day).toEqual('2019/01/07');
          expect(workLogs[1].day).toEqual('2019/01/08');
          done();
        });
    });

    it('should return entries before date', done => {
      return getRequestWithValidToken(app, '/admin/work-log/entries?dateTo=2019-01-05', ['ADMIN'])
        .expect(HttpStatus.OK)
        .then(response => {
          const workLogs = response.body;
          expect(workLogs).toHaveLength(2);
          expect(workLogs[0].day).toEqual('2019/01/05');
          expect(workLogs[1].day).toEqual('2019/01/05');
          done();
        });
    });

    it('should return entries for user and tags', done => {
      return getRequestWithValidToken(app, '/admin/work-log/entries?user=john.doe&tags=holidays,nvm', ['ADMIN'])
        .expect(HttpStatus.OK)
        .then(response => {
          const workLogs = response.body;
          expect(workLogs).toHaveLength(2);
          expect(workLogs[0].employeeID).toEqual('john.doe');
          expect(workLogs[0].projectNames).toContain('holidays');
          expect(workLogs[1].employeeID).toEqual('john.doe');
          expect(workLogs[1].projectNames).toContain('nvm');
          done();
        });
    });

    it('should return BAD REQUEST if both date and dateFrom or dateTo are specified', done => {
      return getRequestWithValidToken(
        app, '/admin/work-log/entries?dateFrom=2019-01-06&dateTo=2019-01-07&date=2019-01-04', ['ADMIN']
      )
        .expect(HttpStatus.BAD_REQUEST, done);
    });

    it('should allow service account to fetch data', done => {
      return getRequestWithValidToken(app, '/admin/work-log/entries', ['EXTERNAL_SERVICE'])
        .expect(HttpStatus.OK, done);
    });

    it('should return FORBIDDEN if token has neither ADMIN nor EXTERNAL_SERVICE role', done => {
      return getRequestWithValidToken(app, '/admin/work-log/entries', ['USER'])
        .expect(HttpStatus.FORBIDDEN, done);
    });
  });

  describe('POST /work-log/:username/entries', () => {
    it('should create entry for valid input', done => {
      const username = 'tom.hanks';
      const requestBody = {day: '2019-01-07', workload: '2h', projectNames: ['projects', 'nvm']};

      return postRequestWithRoles(app, `/admin/work-log/${username}/entries`, requestBody, ['ADMIN'])
        .expect(HttpStatus.CREATED)
        .then(async () => {
          const matchingWorkLogs = await workLogModel.find({'employeeID._id': username}).exec();
          expect(matchingWorkLogs).toHaveLength(1);
          expect(matchingWorkLogs[0].day.date).toEqual('2019/01/07');
          expect(matchingWorkLogs[0].workload.minutes).toEqual(120);
          expect(matchingWorkLogs[0].projectNames.map(p => p.name)).toEqual(['projects', 'nvm']);
          done();
        });
    });

    it('should return BAD REQUEST for invalid date', done => {
      const username = 'tom.hanks';
      const requestBody = {day: '11-01-07a', workload: '2h', projectNames: ['projects', 'nvm']};

      return postRequestWithRoles(app, `/admin/work-log/${username}/entries`, requestBody, ['ADMIN'])
        .expect(HttpStatus.BAD_REQUEST, done);
    });

    it('should return BAD REQUEST for empty projects list', done => {
      const username = 'tom.hanks';
      const requestBody = {day: '2019-01-07', workload: '2h', projectNames: []};

      return postRequestWithRoles(app, `/admin/work-log/${username}/entries`, requestBody, ['ADMIN'])
        .expect(HttpStatus.BAD_REQUEST, done);
    });

    it('should return BAD REQUEST for workload less than 0', done => {
      const username = 'tom.hanks';
      const requestBody = {day: '2019-01-07', workload: '-10m', projectNames: ['nvm']};

      return postRequestWithRoles(app, `/admin/work-log/${username}/entries`, requestBody, ['ADMIN'])
        .expect(HttpStatus.BAD_REQUEST, done);
    });

    it('should allow service account to fetch data', done => {
      const username = 'tom.hanks';
      const requestBody = {day: '2019-01-07', workload: '2h', projectNames: ['projects', 'nvm']};

      return postRequestWithRoles(app, `/admin/work-log/${username}/entries`, requestBody, ['EXTERNAL_SERVICE'])
        .expect(HttpStatus.CREATED, done);
    });

    it('should return FORBIDDEN if token has neither ADMIN nor EXTERNAL_SERVICE role', done => {
      const username = 'tom.hanks';
      const requestBody = {day: '2019-01-07', workload: '2h', projectNames: ['projects', 'nvm']};

      return postRequestWithRoles(app, `/admin/work-log/${username}/entries`, requestBody, ['USER'])
        .expect(HttpStatus.FORBIDDEN, done);
    });
  });

  const reverseSortByEmployee = (a, b) => (-1 * a.employeeID.localeCompare(b.employeeID));
});
