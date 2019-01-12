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
      .then(response => {
        expect(response.body.id).toEqual('2014');
        expect(response.body.link).toEqual('/endpoints/v1/calendar/2014');
        expect(response.body.next).toEqual({link: '/endpoints/v1/calendar/2015'});
        expect(response.body.prev).toEqual({link: '/endpoints/v1/calendar/2013'});
        expect(response.body.months).toHaveLength(12);
        expect(response.body.months[0]).toEqual({
          link: '/endpoints/v1/calendar/2014/01',
          id: '2014/01',
          next: {link: '/endpoints/v1/calendar/2014/02'},
          prev: {link: '/endpoints/v1/calendar/2013/12'}
        });
        expect(response.body.months[11]).toEqual({
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
      .then(response => {
        expect(response.body.id).toEqual('2014/01');
        expect(response.body.link).toEqual('/endpoints/v1/calendar/2014/01');
        expect(response.body.next).toEqual({link: '/endpoints/v1/calendar/2014/02'});
        expect(response.body.prev).toEqual({link: '/endpoints/v1/calendar/2013/12'});
        expect(response.body.days).toHaveLength(31);
        expect(response.body.days[0]).toEqual({
          link: '/endpoints/v1/calendar/2014/01/01',
          id: '2014/01/01',
          holiday: false
        });
        expect(response.body.days[4]).toEqual({
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
        .then(response => {
          const entries = response.body.items;
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
});
