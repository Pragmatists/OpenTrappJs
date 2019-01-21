import { WorkLogController } from './work-log.controller';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Model } from 'mongoose';
import { WorkLog } from '../../work-log/work-log.model';
import MongoMemoryServer from 'mongodb-memory-server';
import {
  deleteRequestWithInvalidToken,
  deleteRequestWithValidToken,
  getRequestWithInvalidToken,
  getRequestWithValidToken,
  postRequestWithInvalidToken,
  postRequestWithValidToken,
  someWorkLog,
  testModuleWithInMemoryDb
} from '../../utils/test-utils';
import { WorkLogModule } from '../../work-log/work-log.module';
import { MockAuthModule } from '../../auth/mock-auth.module';
import { CanUpdateDeleteEntryGuard } from './can-update-delete-entry.guard';

const workLogEntries = [
  someWorkLog('2018/11/05', 'john.doe', 480, ['holidays'], undefined, 'id-to-remove'),
  someWorkLog('2018/12/05', 'james.bond', 480, ['projects', 'syniverse-dsp'], 'Some note', 'id-to-update'),
  someWorkLog('2019/01/14', 'james.bond', 240, ['projects', 'talkie', 'in-progress'])
];

describe('WorkLog Controller', () => {
  let app: INestApplication;
  let workLogModel: Model<WorkLog>;
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    const moduleWithDb = await testModuleWithInMemoryDb({
      imports: [MockAuthModule, WorkLogModule],
      controllers: [WorkLogController],
      providers: [CanUpdateDeleteEntryGuard]
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

      return postRequestWithValidToken(app, `/api/v1/work-log/entries/${idToUpdate}`, requestBody, 'james.bond@pragmatists.pl')
        .send(requestBody)
        .expect(HttpStatus.OK, {status: 'success'})
        .then(async () => {
          const updatedWorkLog = await workLogModel.findById({_id: idToUpdate}).exec();
          expect(updatedWorkLog.day.date).toEqual('2018/12/05');
          expect(updatedWorkLog.workload.minutes).toEqual(60);
          expect(updatedWorkLog.projectNames.map(p => p.name)).toEqual(['nvm']);
          expect(updatedWorkLog.note.text).toEqual('Some note');
          done();
        });
    });

    it('should update existing entry with note', done => {
      const idToUpdate = 'id-to-update';
      const requestBody = {workload: '60m', projectNames: ['nvm'], note: 'Updated note'};

      return postRequestWithValidToken(app, `/api/v1/work-log/entries/${idToUpdate}`, requestBody, 'james.bond@pragmatists.pl')
        .expect(HttpStatus.OK, {status: 'success'})
        .then(async () => {
          const updatedWorkLog = await workLogModel.findById({_id: idToUpdate}).exec();
          expect(updatedWorkLog.day.date).toEqual('2018/12/05');
          expect(updatedWorkLog.workload.minutes).toEqual(60);
          expect(updatedWorkLog.projectNames.map(p => p.name)).toEqual(['nvm']);
          expect(updatedWorkLog.note.text).toEqual('Updated note');
          done();
        });
    });

    it('should return NOT FOUND if entry with id does not exist', done => {
      const idToUpdate = 'not-existing-id';
      const requestBody = {workload: '60m', projectNames: ['nvm']};

      return postRequestWithValidToken(app, `/api/v1/work-log/entries/${idToUpdate}`, requestBody)
        .expect(HttpStatus.NOT_FOUND, done);
    });

    it('should return BAD REQUEST for empty projects list', done => {
      const idToUpdate = 'id-to-update';
      const requestBody = {day: '2019-01-07', workload: '120m', projectNames: []};

      return postRequestWithValidToken(app, `/api/v1/work-log/entries/${idToUpdate}`, requestBody, 'james.bond@pragmatists.pl')
        .expect(HttpStatus.BAD_REQUEST, done);
    });

    it('should return BAD REQUEST for workload less than 0', done => {
      const idToUpdate = 'id-to-update';
      const requestBody = {day: '2019-01-07', workload: '-10', projectNames: ['nvm']};

      return postRequestWithValidToken(app, `/api/v1/work-log/entries/${idToUpdate}`, requestBody, 'james.bond@pragmatists.pl')
        .expect(HttpStatus.BAD_REQUEST, done);
    });

    it('should return UNAUTHORIZED for invalid token', done => {
      const idToUpdate = 'id-to-update';
      const requestBody = {workload: '60m', projectNames: ['nvm']};

      return postRequestWithInvalidToken(app, `/api/v1/work-log/entries/${idToUpdate}`, requestBody)
        .expect(HttpStatus.UNAUTHORIZED, done);
    });

    it('should return FORBIDDEN if entry employee different from name in token', done => {
      const idToUpdate = 'id-to-update';
      const requestBody = {workload: '60m', projectNames: ['nvm']};

      return postRequestWithValidToken(app, `/api/v1/work-log/entries/${idToUpdate}`, requestBody, 'john.doe@pragmatists.com')
        .expect(HttpStatus.FORBIDDEN, done);
    });
  });

  describe('DELETE /work-log/entries/:id', () => {
    it('should delete entry with given id', done => {
      const idToRemove = 'id-to-remove';

      return deleteRequestWithValidToken(app, `/api/v1/work-log/entries/${idToRemove}`, 'john.doe@pragmatists.com')
        .expect(HttpStatus.NO_CONTENT)
        .then(async () => {
          const removedWorkLog = await workLogModel.findById({_id: idToRemove}).exec();
          expect(removedWorkLog).toBeNull();
          done();
        });
    });

    it('should return NOT FOUND if entry with id does not exist', done => {
      const idToRemove = 'not-existing-id';

      return deleteRequestWithValidToken(app, `/api/v1/work-log/entries/${idToRemove}`)
        .expect(HttpStatus.NOT_FOUND, done);
    });

    it('should return UNAUTHORIZED for invalid token', done => {
      const idToRemove = 'id-to-remove';

      return deleteRequestWithInvalidToken(app, `/api/v1/work-log/entries/${idToRemove}`)
        .expect(HttpStatus.UNAUTHORIZED, done);
    });

    it('should return FORBIDDEN if entry employee different from name in token', done => {
      const idToRemove = 'id-to-remove';

      return deleteRequestWithValidToken(app, `/api/v1/work-log/entries/${idToRemove}`, 'andy.barber@pragmatists.pl')
        .expect(HttpStatus.FORBIDDEN, done);
    });
  });

  describe('GET /work-log/:query', () => {
    it('should return total number of entries for empty query', done => {
      return getRequestWithValidToken(app, '/api/v1/work-log/')
        .expect(HttpStatus.OK, {entriesAffected: workLogEntries.length}, done);
    });

    it('should return number of entries for given project', done => {
      return getRequestWithValidToken(app, `/api/v1/work-log/!project=talkie`)
        .expect(HttpStatus.OK, {entriesAffected: 1}, done);
    });

    it('should return number of entries for multiple projects', done => {
      return getRequestWithValidToken(app, '/api/v1/work-log/!project=talkie+!project=syniverse-dsp')
        .expect(HttpStatus.OK, {entriesAffected: 2}, done);
    });

    it('should return number of entries for given employee', done => {
      return getRequestWithValidToken(app, `/api/v1/work-log/!employee=james.bond`)
        .expect(HttpStatus.OK, {entriesAffected: 2}, done);
    });

    it('should return number of entries for multiple employees', done => {
      return getRequestWithValidToken(app, `/api/v1/work-log/!employee=james.bond+!employee=john.doe`)
        .expect(HttpStatus.OK, {entriesAffected: 3}, done);
    });

    it('should return number of entries for given month', done => {
      return getRequestWithValidToken(app, `/api/v1/work-log/!date=2019:01`)
        .expect(HttpStatus.OK, {entriesAffected: 1}, done);
    });

    it('should return number of entries for given day', done => {
      return getRequestWithValidToken(app, `/api/v1/work-log/!date=2018:12:05`)
        .expect(HttpStatus.OK, {entriesAffected: 1}, done);
    });

    it('should return number of entries for given employee and projects and month', done => {
      return getRequestWithValidToken(app, `/api/v1/work-log/!employee=james.bond+!project=talkie+!project=syniverse-dsp+!date=2018:12`)
        .expect(HttpStatus.OK, {entriesAffected: 1}, done);
    });

    it('should return UNAUTHORIZED for invalid token', done => {
      return getRequestWithInvalidToken(app, '/api/v1/work-log/')
        .expect(HttpStatus.UNAUTHORIZED, done);
    });
  });

  describe('POST /work-log/bulk-update', () => {
    it('should update tags for entries matching query', done => {
      const requestBody = {
        query: '#projects',
        expression: '+#completed -#in-progress'
      };

      return postRequestWithValidToken(app, '/api/v1/work-log/bulk-update', requestBody, 'james.bond@pragmatists.pl')
        .expect(HttpStatus.OK, {entriesAffected: 3})
        .then(async () => {
          const updatedEntries = await workLogModel.find({'projectNames.name': 'projects'}).exec();
          expect(updatedEntries[0].projectNames.map(p => p.name).sort())
            .toEqual(['completed', 'projects', 'syniverse-dsp']);
          expect(updatedEntries[1].projectNames.map(p => p.name).sort())
            .toEqual(['completed', 'projects', 'talkie']);
          done();
        });
    });

    it('should return BAD REQUEST for invalid expression', done => {
      const requestBody = {
        query: '#projects',
        expression: '+#completed -#in-progress ++#to-add to-remove'
      };

      return postRequestWithValidToken(app, '/api/v1/work-log/bulk-update', requestBody)
        .send(requestBody)
        .expect(HttpStatus.BAD_REQUEST, done);
    });

    it('should return UNAUTHORIZED for invalid token', done => {
      const requestBody = {
        query: '#projects',
        expression: '+#completed -#in-progress'
      };

      return postRequestWithInvalidToken(app, '/api/v1/work-log/bulk-update', requestBody)
        .expect(HttpStatus.UNAUTHORIZED, done);
    });

    it(`should return FORBIDDEN for modification of other employee's entries`, done => {
      const requestBody = {
        query: '#projects',
        expression: '+#completed -#in-progress'
      };

      return postRequestWithValidToken(app, '/api/v1/work-log/bulk-update', requestBody, 'john.doe@pragmatists.pl')
        .expect(HttpStatus.FORBIDDEN, done);
    });
  });
});
