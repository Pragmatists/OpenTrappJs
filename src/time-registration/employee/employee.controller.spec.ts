import { EmployeeController } from './employee.controller';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Model } from 'mongoose';
import { WorkLog } from '../../work-log/work-log.model';
import { MongoMemoryServer } from 'mongodb-memory-server';
import {
  getRequestWithInvalidToken,
  getRequestWithValidToken,
  postRequestWithInvalidToken,
  postRequestWithValidToken,
  someWorkLog,
  testModuleWithInMemoryDb
} from '../../utils/test-utils';
import { WorkLogModule } from '../../work-log/work-log.module';
import { MockAuthModule } from '../../auth/mock-auth.module';
import { CanCreateEntryGuard } from './can-create-entry.guard';

const workLogEntries = [
  someWorkLog('2018/11/05', 'john.doe', 480, ['holidays']),
  someWorkLog('2018/12/05', 'james.bond', 480, ['projects', 'syniverse-dsp']),
  someWorkLog('2019/01/06', 'james.bond', 480, ['projects', 'syniverse-dsp']),
  someWorkLog('2019/01/11', 'tom.hanks', 480, ['projects', 'nvm'])
];

describe('Employee Controller', () => {
  let app: INestApplication;
  let workLogModel: Model<WorkLog>;
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    const moduleWithDb = await testModuleWithInMemoryDb({
      imports: [MockAuthModule, WorkLogModule],
      controllers: [EmployeeController],
      providers: [CanCreateEntryGuard]
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

  describe('GET /employee/:employeeID/work-log/entries', () => {
    it('should return entries for given employee', done => {
      const employee = 'james.bond';
      return getRequestWithValidToken(app, `employee/${employee}/work-log/entries`)
        .expect(HttpStatus.OK)
        .then(response => response.body)
        .then(entries => {
          expect(entries).toHaveLength(2);
          expect(entries.map(e => e.employee).every(name => name === employee)).toBeTruthy();
          done();
        });
    });

    it('should return UNAUTHORIZED for invalid token', done => {
      const employee = 'james.bond';
      return getRequestWithInvalidToken(app, `employee/${employee}/work-log/entries`)
        .expect(HttpStatus.UNAUTHORIZED, done);
    });
  });

  describe('POST /employee/:employeeID/work-log/entries', () => {
    it('should register new work log', done => {
      const employee = 'andy.barber';
      const requestBody = {day: '2019-01-12', workload: '2h', projectNames: ['projects', 'nvm']};

      return postRequestWithValidToken(app, `employee/${employee}/work-log/entries`, requestBody, 'andy.barber@pragmatists.pl')
        .expect(HttpStatus.CREATED)
        .then(async () => {
          const entry = await workLogModel.findOne({'employeeID._id': employee}).lean().exec();
          expect(entry.day.date).toEqual('2019/01/12');
          expect(entry.workload.minutes).toEqual(120);
          expect(entry.projectNames.map(p => p.name)).toEqual(['projects', 'nvm']);
          done();
        });
    });

    it('should trim project names in saved work log', done => {
      const employee = 'andy.barber';
      const requestBody = {day: '2019-01-12', workload: '1h', projectNames: ['projects  ', ' nvm ']};

      return postRequestWithValidToken(app, `employee/${employee}/work-log/entries`, requestBody, 'andy.barber@pragmatists.pl')
        .expect(HttpStatus.CREATED)
        .then(async () => {
          const entry = await workLogModel.findOne({'employeeID._id': employee}).lean().exec();
          expect(entry.projectNames.map(p => p.name)).toEqual(['projects', 'nvm']);
          done();
        });
    });

    it('should return BAD REQUEST for invalid date', done => {
      const employee = 'john.doe';
      const requestBody = {day: '11-01-07a', workload: '2h', projectNames: ['projects', 'nvm']};

      return postRequestWithValidToken(app, `employee/${employee}/work-log/entries`, requestBody)
        .send(requestBody)
        .expect(HttpStatus.BAD_REQUEST, done);
    });

    it('should return BAD REQUEST for empty projects list', done => {
      const employee = 'john.doe';
      const requestBody = {day: '2019-01-07', workload: '120m', projectNames: []};

      return postRequestWithValidToken(app, `employee/${employee}/work-log/entries`, requestBody)
        .send(requestBody)
        .expect(HttpStatus.BAD_REQUEST, done);
    });

    it('should return BAD REQUEST for workload less than 0', done => {
      const employee = 'john.doe';
      const requestBody = {day: '2019-01-07', workload: '-10m', projectNames: ['nvm']};

      return postRequestWithValidToken(app, `employee/${employee}/work-log/entries`, requestBody)
        .send(requestBody)
        .expect(HttpStatus.BAD_REQUEST, done);
    });

    it('should return UNAUTHORIZED for invalid token', done => {
      const employee = 'john.doe';
      const requestBody = {day: '2019-01-12', workload: '2h', projectNames: ['projects', 'nvm']};
      return postRequestWithInvalidToken(app, `employee/${employee}/work-log/entries`, requestBody)
        .expect(HttpStatus.UNAUTHORIZED, done);
    });

    it('should return FORBIDDEN if employee different from name in token', done => {
      const employee = 'andy.barber';
      const requestBody = {day: '2019-01-12', workload: '2h', projectNames: ['projects', 'nvm']};

      return postRequestWithValidToken(app, `employee/${employee}/work-log/entries`, requestBody, 'john.doe@pragmatists.pl')
        .send(requestBody)
        .expect(HttpStatus.FORBIDDEN, done);
    });
  });
});
