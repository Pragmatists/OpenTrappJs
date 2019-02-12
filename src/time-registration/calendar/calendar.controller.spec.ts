import { CalendarController } from './calendar.controller';
import { HttpModule, HttpStatus, INestApplication } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import {
  getRequestWithInvalidToken,
  getRequestWithValidToken,
  someWorkLog,
  testModuleWithInMemoryDb
} from '../../utils/test-utils';
import { Model } from 'mongoose';
import { WorkLog } from '../../work-log/work-log.model';
import MongoMemoryServer from 'mongodb-memory-server';
import { WorkLogModule } from '../../work-log/work-log.module';
import { MockAuthModule } from '../../auth/mock-auth.module';
import { HolidayService } from './holiday.service';
import * as nock from 'nock';

const workLogEntries = [
  someWorkLog('2018/11/05', 'john.doe', 480, ['holidays']),
  someWorkLog('2018/12/05', 'james.bond', 480, ['projects', 'syniverse-dsp']),
  someWorkLog('2019/01/06', 'james.bond', 480, ['projects', 'syniverse-dsp']),
  someWorkLog('2019/01/11', 'tom.hanks', 480, ['projects', 'nvm'])
];

const holidaysResponse = [
  {
    date: {
      day: 25,
      month: 12,
      year: 2018,
      dayOfWeek: 2
    },
    localName: 'Boże Narodzenie',
    englishName: 'Christmas Day'
  },
  {
    date: {
      day: 26,
      month: 12,
      year: 2018,
      dayOfWeek: 3
    },
    localName: 'Drugi dzień Bożego Narodzenia',
    englishName: 'Boxing Day'
  }
];

describe('Calendar Controller', () => {
  let app: INestApplication;
  let workLogModel: Model<WorkLog>;
  let mongoServer: MongoMemoryServer;
  let holidayService: HolidayService;

  beforeAll(async () => {
    const moduleWithDb = await testModuleWithInMemoryDb({
      imports: [MockAuthModule, WorkLogModule, HttpModule],
      controllers: [CalendarController],
      providers: [CalendarService, HolidayService]
    });
    const module = moduleWithDb.module;
    mongoServer = moduleWithDb.mongoServer;
    workLogModel = module.get('WorkLogModel');
    holidayService = module.get(HolidayService);

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

  describe('GET /calendar/:year', () => {
    it('should return particular year', done => {
      return getRequestWithValidToken(app, '/calendar/2018')
        .expect(HttpStatus.OK)
        .then(response => response.body)
        .then(responseBody => {
          expect(responseBody.id).toEqual('2018');
          expect(responseBody.link).toEqual('/api/v1/calendar/2018');
          expect(responseBody.next).toEqual({link: '/api/v1/calendar/2019'});
          expect(responseBody.prev).toEqual({link: '/api/v1/calendar/2017'});
          expect(responseBody.months).toHaveLength(12);
          expect(responseBody.months[0]).toEqual({
            link: '/api/v1/calendar/2018/01',
            id: '2018/01',
            next: {link: '/api/v1/calendar/2018/02'},
            prev: {link: '/api/v1/calendar/2017/12'}
          });
          expect(responseBody.months[11]).toEqual({
            link: '/api/v1/calendar/2018/12',
            id: '2018/12',
            next: {link: '/api/v1/calendar/2019/01'},
            prev: {link: '/api/v1/calendar/2018/11'}
          });
          done();
        });
    });

    it('should return UNAUTHORIZED for invalid token', done => {
      return getRequestWithInvalidToken(app, '/calendar/2018')
        .expect(HttpStatus.UNAUTHORIZED, done);
    });
  });

  describe('GET /calendar/:year/:month', () => {
    let interceptor;

    beforeEach(() => {
      interceptor = nock('https://kayaposoft.com/enrico/json/v1.0')
        .get(/.*/)
        .query({
          action: 'getPublicHolidaysForDateRange',
          country: 'pol',
          fromDate: '01-12-2018',
          toDate: '31-12-2018'
        })
        .reply(200, holidaysResponse);
    });

    afterEach(() => {
      nock.removeInterceptor(interceptor);
    });

    it('should return particular month', done => {
      return getRequestWithValidToken(app, '/calendar/2018/12')
        .expect(HttpStatus.OK)
        .then(response => response.body)
        .then(responseBody => {
          expect(responseBody.id).toEqual('2018/12');
          expect(responseBody.link).toEqual('/api/v1/calendar/2018/12');
          expect(responseBody.next).toEqual({link: '/api/v1/calendar/2019/01'});
          expect(responseBody.prev).toEqual({link: '/api/v1/calendar/2018/11'});
          expect(responseBody.days).toHaveLength(31);
          expect(responseBody.days[0]).toEqual({
            link: '/api/v1/calendar/2018/12/01',
            id: '2018/12/01',
            weekend: true,
            holiday: false
          });
          expect(responseBody.days[4]).toEqual({
            link: '/api/v1/calendar/2018/12/05',
            id: '2018/12/05',
            weekend: false,
            holiday: false
          });
          done();
        });
    });

    it('should mark holidays', done => {
      return getRequestWithValidToken(app, '/calendar/2018/12')
        .expect(HttpStatus.OK)
        .then(response => response.body)
        .then(responseBody => {
          expect(responseBody.id).toEqual('2018/12');
          expect(responseBody.days).toHaveLength(31);
          expect(responseBody.days[2].holiday).toBeFalsy();
          expect(responseBody.days[23].holiday).toBeFalsy();
          expect(responseBody.days[24].holiday).toBeTruthy();
          expect(responseBody.days[25].holiday).toBeTruthy();
          done();
        });
    });

    it('should return UNAUTHORIZED for invalid token', done => {
      return getRequestWithInvalidToken(app, '/calendar/2014/01')
        .expect(HttpStatus.UNAUTHORIZED, done);
    });
  });

  describe('GET /calendar/:year/:month:/work-log/entries', () => {
    it('should return entries for given year and month', done => {
      return getRequestWithValidToken(app, '/calendar/2019/01/work-log/entries')
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
      return getRequestWithValidToken(app, '/calendar/19a4/01/work-log/entries')
        .expect(HttpStatus.BAD_REQUEST, done);
    });

    it('should return BAD REQUEST for invalid month', done => {
      return getRequestWithValidToken(app, '/calendar/2018/22/work-log/entries')
        .expect(HttpStatus.BAD_REQUEST, done);
    });

    it('should return UNAUTHORIZED for invalid token', done => {
      getRequestWithInvalidToken(app, '/calendar/2018/22/work-log/entries')
        .expect(HttpStatus.UNAUTHORIZED, done);
    });
  });

  describe('GET /calendar/:yearMonthList/work-log/entries', () => {
    it('should return entries for specified months', done => {
      return getRequestWithValidToken(app, '/calendar/201812,201901,201902/work-log/entries')
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
      return getRequestWithValidToken(app, '/calendar/20181212,2019-01/work-log/entries')
        .expect(HttpStatus.BAD_REQUEST, done);
    });

    it('should return UNAUTHORIZED for invalid token', done => {
      return getRequestWithInvalidToken(app, '/calendar/201812,201901,201902/work-log/entries')
        .expect(HttpStatus.UNAUTHORIZED, done);
    });
  });
});
