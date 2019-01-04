import * as request from 'supertest';
import {Test} from '@nestjs/testing';
import {AdminController} from './admin.controller';
import {WorkLogService} from '../work-log/work-log.service';
import {TagsService} from '../work-log/tags.service';
import {INestApplication} from '@nestjs/common';
import {getModelToken} from '@nestjs/mongoose';
import {of} from 'rxjs';
import {MockAuthModule} from '../auth/mock-auth.module';

class TestWorkLogModel {
  distinct(field: string) {
    return {
      exec() {
        return of(['projects', 'syniverse-dsp', 'holidays']);
      }
    };
  }
}

describe('AdminController', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [MockAuthModule],
      controllers: [AdminController],
      providers: [
        WorkLogService,
        TagsService,
        {
          provide: getModelToken('WorkLog'),
          useValue: new TestWorkLogModel()
        }
      ]
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  it('GET /tags should return list of available tags', () => {
    return request(app.getHttpServer())
      .get('/admin/tags')
      .set('Authorization', 'Bearer test-token')
      .expect(200)
      .expect(['projects', 'syniverse-dsp', 'holidays']);
  });
});
