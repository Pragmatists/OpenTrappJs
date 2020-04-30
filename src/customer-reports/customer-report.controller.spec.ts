import {HttpStatus, INestApplication} from '@nestjs/common';
import {MongoMemoryServer} from 'mongodb-memory-server';
import {
    getRequestWithInvalidToken, postRequestWithValidToken, putRequestWithValidToken, testModuleWithInMemoryDb
} from '../utils/test-utils';
import {WorkLogModule} from '../work-log/work-log.module';
import {MockAuthModule} from '../auth/mock-auth.module';
import {CustomerReportController} from './customer-report.controller';
import {CustomerReportService} from './customer-report.service';
import {MongooseModule} from '@nestjs/mongoose';
import {CustomerTokenSchema} from './customer-token.schema';

describe('WorkLog Controller', () => {
    let app: INestApplication;
    let mongoServer: MongoMemoryServer;
    let customerReportService: CustomerReportService;
    beforeAll(async () => {
        const moduleWithDb = await testModuleWithInMemoryDb({
            imports: [MockAuthModule, WorkLogModule,
                MongooseModule.forFeature(
                    [{name: 'CustomerToken', schema: CustomerTokenSchema, collection: 'customerTokens'}])],
            controllers: [CustomerReportController],
            providers: [CustomerReportService]
        });
        const module = moduleWithDb.module;
        mongoServer = moduleWithDb.mongoServer;
        app = module.createNestApplication();
        customerReportService = module.get('CustomerReportService');
        await app.init();
    });

    afterAll(async () => {
        await app.close();
        await mongoServer.stop();
    });

    describe('POST customer-reports', () => {
        it('should fail when no customerName provided', async () => {
            const requestBody = {customerName: '', tags: ['nvm']};

            await postRequestWithValidToken(app, `customer-reports`, requestBody, 'james.bond@pragmatists.pl')
                .send(requestBody)
                .expect(HttpStatus.BAD_REQUEST);
        });
        it('should fail when no tags provided', async () => {
            const requestBody = {customerName: 'abc', tags: []};

            await postRequestWithValidToken(app, `customer-reports`, requestBody, 'james.bond@pragmatists.pl')
                .send(requestBody)
                .expect(HttpStatus.BAD_REQUEST);
        });
        it('should generate customer token ', async () => {
            const requestBody = {customerName: 'newvoicemedia', tags: ['nvm']};

            const {body: {token}} = await postRequestWithValidToken(app, `customer-reports`, requestBody, 'james.bond@pragmatists.pl')
                .send(requestBody)
                .expect(HttpStatus.CREATED);

            const tags = await customerReportService.findTagsByCustomerNameAndToken(requestBody.customerName, token).toPromise();
            expect(tags).toEqual(['nvm']);
        });
    });

});
