import * as request from 'supertest';
import {Test} from '@nestjs/testing';
import {CalendarController} from './calendar.controller';
import {INestApplication} from '@nestjs/common';
import {CalendarService} from './calendar.service';

describe('Calendar Controller', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [CalendarController],
      providers: [CalendarService]
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return particular year', done => {
    request(app.getHttpServer())
      .get('/endpoints/v1/calendar/2014')
      .expect(200)
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
    request(app.getHttpServer())
      .get('/endpoints/v1/calendar/2014/01')
      .expect(200)
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
});
