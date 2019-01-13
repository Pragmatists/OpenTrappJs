import * as request from 'supertest';
import { WorkLogController } from './work-log.controller';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Model } from 'mongoose';
import { WorkLog } from '../../work-log/work-log.model';
import MongoMemoryServer from 'mongodb-memory-server';
import { someWorkLog, testModuleWithInMemoryDb } from '../../utils/test-utils';
import { WorkLogModule } from '../../work-log/work-log.module';

const workLogEntries = [
  someWorkLog('2018/11/05', 'john.doe', 480, ['holidays'], undefined, 'id-to-remove'),
  someWorkLog('2018/12/05', 'james.bond', 480, ['projects', 'syniverse-dsp'], 'Some note', 'id-to-update')
];

describe('WorkLog Controller', () => {
  let app: INestApplication;
  let workLogModel: Model<WorkLog>;
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    const moduleWithDb = await testModuleWithInMemoryDb({
      imports: [WorkLogModule],
      controllers: [WorkLogController]
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

  describe('POST /work-log/entries/:id', () => {
    it('should update existing entry', done => {
      const idToUpdate = 'id-to-update';
      const requestBody = {workload: '60m', projectNames: ['nvm']};

      request(app.getHttpServer())
        .post(`/endpoints/v1/work-log/entries/${idToUpdate}`)
        .expect(HttpStatus.OK, {status: 'success'})
        .send(requestBody)
        .then(async () => {
          const updatedWorkLog = await workLogModel.findById({_id: idToUpdate}).exec();
          expect(updatedWorkLog.day.date).toEqual('2018/12/05');
          expect(updatedWorkLog.workload.minutes).toEqual(60);
          expect(updatedWorkLog.projectNames.map(p => p.name)).toEqual(['nvm']);
          expect(updatedWorkLog.note.text).toEqual('Some note');
          done();
        });
    });

    it('should return NOT FOUND if entry with id does not exist', done => {
      const idToUpdate = 'not-existing-id';
      const requestBody = {workload: '60m', projectNames: ['nvm']};

      request(app.getHttpServer())
        .post(`/endpoints/v1/work-log/entries/${idToUpdate}`)
        .send(requestBody)
        .expect(HttpStatus.NOT_FOUND, done);
    });

    it('should return BAD REQUEST for empty projects list', done => {
      const idToUpdate = 'not-existing-id';
      const requestBody = {day: '2019-01-07', workload: '120m', projectNames: []};

      return request(app.getHttpServer())
        .post(`/endpoints/v1/work-log/entries/${idToUpdate}`)
        .send(requestBody)
        .expect(HttpStatus.BAD_REQUEST, done);
    });

    it('should return BAD REQUEST for workload less than 0', done => {
      const idToUpdate = 'not-existing-id';
      const requestBody = {day: '2019-01-07', workload: '-10', projectNames: ['nvm']};

      return request(app.getHttpServer())
        .post(`/endpoints/v1/work-log/entries/${idToUpdate}`)
        .send(requestBody)
        .expect(HttpStatus.BAD_REQUEST, done);
    });
  });

  describe('DELETE /work-log/entries/:id', () => {
    it('should delete entry with given id', done => {
      const idToRemove = 'id-to-remove';

      request(app.getHttpServer())
        .delete(`/endpoints/v1/work-log/entries/${idToRemove}`)
        .expect(HttpStatus.NO_CONTENT)
        .then(async () => {
          const removedWorkLog = await workLogModel.findById({_id: idToRemove}).exec();
          expect(removedWorkLog).toBeNull();
          done();
        });
    });

    it('should return NOT FOUND if entry with id does not exist', done => {
      const idToRemove = 'not-existing-id';

      request(app.getHttpServer())
        .delete(`/endpoints/v1/work-log/entries/${idToRemove}`)
        .expect(HttpStatus.NOT_FOUND, done);
    });
  });
});
