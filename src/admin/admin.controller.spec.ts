import * as request from 'supertest';
import {AdminController} from './admin.controller';
import {INestApplication} from '@nestjs/common';
import {MockServiceAuthModule} from '../service-auth/mock-service-auth.module';
import {WorkLogModule} from '../work-log/work-log.module';
import {Model} from 'mongoose';
import {WorkLog, WorkLogDTO} from '../work-log/work-log.model';
import {someWorkLog, testModuleWithInMemoryDb} from '../utils/test-utils';
import MongoMemoryServer from 'mongodb-memory-server';

const workLogEntries = [
  someWorkLog('2019/01/05', 'john.doe', 480, ['holidays'], 'National holidays'),
  someWorkLog('2019/01/05', 'james.bond', 480, ['projects', 'syniverse-dsp']),
  someWorkLog('2019/01/06', 'james.bond', 480, ['projects', 'syniverse-dsp'])
];

describe('AdminController', () => {
  let app: INestApplication;
  let workLogModel: Model<WorkLog>;
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    const moduleWithDb = await testModuleWithInMemoryDb({
      imports: [MockServiceAuthModule, WorkLogModule],
      controllers: [AdminController]
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
    return authorizedGetRequest('/admin/tags')
      .expect(200)
      .expect(['holidays', 'projects', 'syniverse-dsp'], done);
  });

  describe('GET /work-log/entries', () => {
    it('should return complete list of entries if neither user nor date is specified', done => {
      return authorizedGetRequest('/admin/work-log/entries')
        .expect(200)
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
      return authorizedGetRequest('/admin/work-log/entries?user=john.doe')
        .expect(200)
        .then(response => {
          const workLogs = response.body;
          expect(workLogs).toHaveLength(1);
          expect(workLogs[0].employeeID).toEqual('john.doe');
          done();
        });
    });

    it('should return entries for date', done => {
      return authorizedGetRequest('/admin/work-log/entries?date=2019-01-05')
        .expect(200)
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
      const requestBody = {day: '2019-01-07', workload: 120, projectNames: ['projects', 'nvm']};

      return authorizedPostRequest(`/admin/work-log/${username}/entries`, requestBody)
        .expect(201)
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
      const requestBody = {day: '11-01-07a', workload: 120, projectNames: ['projects', 'nvm']};

      return authorizedPostRequest(`/admin/work-log/${username}/entries`, requestBody)
        .expect(400, done);
    });

    it('should return BAD REQUEST for empty projects list', done => {
      const username = 'tom.hanks';
      const requestBody = {day: '2019-01-07', workload: 120, projectNames: []};

      return authorizedPostRequest(`/admin/work-log/${username}/entries`, requestBody)
        .expect(400, done);
    });

    it('should return BAD REQUEST for workload less than 0', done => {
      const username = 'tom.hanks';
      const requestBody = {day: '2019-01-07', workload: -10, projectNames: ['nvm']};

      return authorizedPostRequest(`/admin/work-log/${username}/entries`, requestBody)
        .expect(400, done);
    });
  });

  function authorizedGetRequest(url: string) {
    return request(app.getHttpServer())
      .get(url)
      .set('Authorization', 'Bearer test-token');
  }

  function authorizedPostRequest(url: string, body: string | object) {
    return request(app.getHttpServer())
      .post(url)
      .send(body)
      .set('Authorization', 'Bearer test-token');
  }

  const reverseSortByEmployee = (a, b) => (-1 * a.employeeID.localeCompare(b.employeeID));
});
