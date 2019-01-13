import * as request from 'supertest';
import { EmployeeController } from './employee.controller';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Model } from 'mongoose';
import { WorkLog } from '../../work-log/work-log.model';
import MongoMemoryServer from 'mongodb-memory-server';
import { someWorkLog, testModuleWithInMemoryDb } from '../../utils/test-utils';
import { WorkLogModule } from '../../work-log/work-log.module';

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
      imports: [WorkLogModule],
      controllers: [EmployeeController]
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

  describe('GET /employee/:employeeID/work-log/entries', () => {
    it('should return entries for given employee', done => {
      const employee = 'james.bond';
      return request(app.getHttpServer())
        .get(`/endpoints/v1/employee/${employee}/work-log/entries`)
        .expect(HttpStatus.OK)
        .then(response => response.body.items)
        .then(entries => {
          expect(entries).toHaveLength(2);
          expect(entries.map(e => e.employee).every(name => name === employee)).toBeTruthy();
          done();
        });
    });
  });

  describe('POST /employee/:employeeID/work-log/entries', () => {
    it('should register new work log', done => {
      const employee = 'andy.white';
      const requestBody = {day: '2019-01-12', workload: '2h', projectNames: ['projects', 'nvm']};

      return request(app.getHttpServer())
        .post(`/endpoints/v1/employee/${employee}/work-log/entries`)
        .send(requestBody)
        .expect(HttpStatus.CREATED)
        .then(async () => {
          const entry = await workLogModel.findOne({'employeeID._id': employee}).exec();
          expect(entry.day.date).toEqual('2019/01/12');
          expect(entry.workload.minutes).toEqual(120);
          expect(entry.projectNames.map(p => p.name)).toEqual(['projects', 'nvm']);
          done();
        });
    });

    it('should return BAD REQUEST for invalid date', done => {
      const employee = 'andy.white';
      const requestBody = {day: '11-01-07a', workload: '2h', projectNames: ['projects', 'nvm']};

      return request(app.getHttpServer())
        .post(`/endpoints/v1/employee/${employee}/work-log/entries`)
        .send(requestBody)
        .expect(HttpStatus.BAD_REQUEST, done);
    });

    it('should return BAD REQUEST for empty projects list', done => {
      const employee = 'andy.white';
      const requestBody = {day: '2019-01-07', workload: '120m', projectNames: []};

      return request(app.getHttpServer())
        .post(`/endpoints/v1/employee/${employee}/work-log/entries`)
        .send(requestBody)
        .expect(HttpStatus.BAD_REQUEST, done);
    });

    it('should return BAD REQUEST for workload less than 0', done => {
      const employee = 'andy.white';
      const requestBody = {day: '2019-01-07', workload: '-10m', projectNames: ['nvm']};

      return request(app.getHttpServer())
        .post(`/endpoints/v1/employee/${employee}/work-log/entries`)
        .send(requestBody)
        .expect(HttpStatus.BAD_REQUEST, done);
    });
  });
});
