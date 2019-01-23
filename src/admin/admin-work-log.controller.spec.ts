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
import MongoMemoryServer from 'mongodb-memory-server';

const workLogEntries = [
  someWorkLog('2019/01/05', 'john.doe', 480, ['holidays'], 'National holidays'),
  someWorkLog('2019/01/05', 'james.bond', 480, ['projects', 'syniverse-dsp']),
  someWorkLog('2019/01/06', 'james.bond', 480, ['projects', 'syniverse-dsp'])
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
    await workLogModel.deleteMany({});
  });

  it('GET /tags should return list of available tags', done => {
    return getRequestWithValidToken(app, '/api/v1/admin/tags', ['ADMIN'])
      .expect(HttpStatus.OK)
      .expect(['holidays', 'projects', 'syniverse-dsp'], done);
  });

  describe('GET /work-log/entries', () => {
    it('should return complete list of entries if neither user nor date is specified', done => {
      return getRequestWithValidToken(app, '/api/v1/admin/work-log/entries', ['ADMIN'])
        .expect(HttpStatus.OK)
        .then(response => {
          const workLogs: WorkLogDTO[] = response.body;
          return workLogs.sort(reverseSortByEmployee);
        })
        .then(workLogs => {
          expect(workLogs).toHaveLength(3);
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
      return getRequestWithValidToken(app, '/api/v1/admin/work-log/entries?user=john.doe', ['ADMIN'])
        .expect(HttpStatus.OK)
        .then(response => {
          const workLogs = response.body;
          expect(workLogs).toHaveLength(1);
          expect(workLogs[0].employeeID).toEqual('john.doe');
          done();
        });
    });

    it('should return entries for date', done => {
      return getRequestWithValidToken(app, '/api/v1/admin/work-log/entries?date=2019-01-05', ['ADMIN'])
        .expect(HttpStatus.OK)
        .then(response => {
          const workLogs = response.body;
          expect(workLogs).toHaveLength(2);
          expect(workLogs[0].day).toEqual('2019/01/05');
          expect(workLogs[1].day).toEqual('2019/01/05');
          done();
        });
    });
  });

  describe('POST /work-log/:username/entries', () => {
    it('should create entry for valid input', done => {
      const username = 'tom.hanks';
      const requestBody = {day: '2019-01-07', workload: '2h', projectNames: ['projects', 'nvm']};

      return postRequestWithRoles(app, `/api/v1/admin/work-log/${username}/entries`, requestBody, ['ADMIN'])
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

      return postRequestWithRoles(app, `/api/v1/admin/work-log/${username}/entries`, requestBody, ['ADMIN'])
        .expect(HttpStatus.BAD_REQUEST, done);
    });

    it('should return BAD REQUEST for empty projects list', done => {
      const username = 'tom.hanks';
      const requestBody = {day: '2019-01-07', workload: '2h', projectNames: []};

      return postRequestWithRoles(app, `/api/v1/admin/work-log/${username}/entries`, requestBody, ['ADMIN'])
        .expect(HttpStatus.BAD_REQUEST, done);
    });

    it('should return BAD REQUEST for workload less than 0', done => {
      const username = 'tom.hanks';
      const requestBody = {day: '2019-01-07', workload: '-10m', projectNames: ['nvm']};

      return postRequestWithRoles(app, `/api/v1/admin/work-log/${username}/entries`, requestBody, ['ADMIN'])
        .expect(HttpStatus.BAD_REQUEST, done);
    });
  });

  const reverseSortByEmployee = (a, b) => (-1 * a.employeeID.localeCompare(b.employeeID));
});
