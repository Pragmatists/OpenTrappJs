import * as request from 'supertest';
import { CalendarController } from './calendar.controller';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { someWorkLog, testModuleWithInMemoryDb } from '../../utils/test-utils';
import { Model } from 'mongoose';
import { WorkLog } from '../../work-log/work-log.model';
import MongoMemoryServer from 'mongodb-memory-server';
import { WorkLogModule } from '../../work-log/work-log.module';

const workLogEntries = [
  someWorkLog('2018/11/05', 'john.doe', 480, ['holidays'], 'National holidays'),
  someWorkLog('2018/12/05', 'james.bond', 480, ['projects', 'syniverse-dsp']),
  someWorkLog('2019/01/06', 'james.bond', 480, ['projects', 'syniverse-dsp']),
  someWorkLog('2019/01/11', 'tom.hanks', 480, ['projects', 'nvm'])
];

describe('Calendar Controller', () => {
  let app: INestApplication;
  let workLogModel: Model<WorkLog>;
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    const moduleWithDb = await testModuleWithInMemoryDb({
      imports: [WorkLogModule],
      controllers: [CalendarController],
      providers: [CalendarService]
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

  it('should return particular year', done => {
    return request(app.getHttpServer())
      .get('/endpoints/v1/calendar/2014')
      .expect(HttpStatus.OK)
      .then(response => response.body)
      .then(responseBody => {
        expect(responseBody.id).toEqual('2014');
        expect(responseBody.link).toEqual('/endpoints/v1/calendar/2014');
        expect(responseBody.next).toEqual({link: '/endpoints/v1/calendar/2015'});
        expect(responseBody.prev).toEqual({link: '/endpoints/v1/calendar/2013'});
        expect(responseBody.months).toHaveLength(12);
        expect(responseBody.months[0]).toEqual({
          link: '/endpoints/v1/calendar/2014/01',
          id: '2014/01',
          next: {link: '/endpoints/v1/calendar/2014/02'},
          prev: {link: '/endpoints/v1/calendar/2013/12'}
        });
        expect(responseBody.months[11]).toEqual({
          link: '/endpoints/v1/calendar/2014/12',
          id: '2014/12',
          next: {link: '/endpoints/v1/calendar/2015/01'},
          prev: {link: '/endpoints/v1/calendar/2014/11'}
        });
        done();
      });
  });

  it('should return particular month', done => {
    return request(app.getHttpServer())
      .get('/endpoints/v1/calendar/2014/01')
      .expect(HttpStatus.OK)
      .then(response => response.body)
      .then(responseBody => {
        expect(responseBody.id).toEqual('2014/01');
        expect(responseBody.link).toEqual('/endpoints/v1/calendar/2014/01');
        expect(responseBody.next).toEqual({link: '/endpoints/v1/calendar/2014/02'});
        expect(responseBody.prev).toEqual({link: '/endpoints/v1/calendar/2013/12'});
        expect(responseBody.days).toHaveLength(31);
        expect(responseBody.days[0]).toEqual({
          link: '/endpoints/v1/calendar/2014/01/01',
          id: '2014/01/01',
          holiday: false
        });
        expect(responseBody.days[4]).toEqual({
          link: '/endpoints/v1/calendar/2014/01/05',
          id: '2014/01/05',
          holiday: true
        });
        done();
      });
  });

  describe('GET /calendar/:year/:month:/work-log/entries', () => {
    it('should return entries for given year and month', done => {
      return request(app.getHttpServer())
        .get('/endpoints/v1/calendar/2019/01/work-log/entries')
        .expect(HttpStatus.OK)
        .then(response => response.body.items)
        .then(entries => {
          expect(entries).toHaveLength(2);
          expect(entries[0].day).toEqual('2019/01/06');
          expect(entries[1].day).toEqual('2019/01/11');
          done();
        });
    });

    it('should return BAD REQUEST for invalid year', done => {
      return request(app.getHttpServer())
        .get('/endpoints/v1/calendar/19a4/01/work-log/entries')
        .expect(HttpStatus.BAD_REQUEST, done);
    });

    it('should return BAD REQUEST for invalid month', done => {
      return request(app.getHttpServer())
        .get('/endpoints/v1/calendar/2018/22/work-log/entries')
        .expect(HttpStatus.BAD_REQUEST, done);
    });
  });

  describe('GET /calendar/:yearMonthList/work-log/entries', () => {
    it('should return entries for specified months', done => {
      return request(app.getHttpServer())
        .get('/endpoints/v1/calendar/201812,201901,201902/work-log/entries')
        .expect(HttpStatus.OK)
        .then(response => response.body.items)
        .then(entries => {
          expect(entries).toHaveLength(3);
          expect(entries[0].day).toEqual('2018/12/05');
          expect(entries[1].day).toEqual('2019/01/06');
          expect(entries[2].day).toEqual('2019/01/11');
          done();
        });
    });

    it('should return BAD REQUEST for invalid months list', done => {
      return request(app.getHttpServer())
        .get('/endpoints/v1/calendar/20181212,2019-01/work-log/entries')
        .expect(HttpStatus.BAD_REQUEST, done);
    });
  });
});
