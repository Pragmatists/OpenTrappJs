import {HttpStatus, INestApplication} from '@nestjs/common';
import {MongoMemoryServer} from 'mongodb-memory-server';
import {
    postRequestWithRoles,
    someWorkLog,
    testModuleWithInMemoryDb
} from '../utils/test-utils';
import {WorkLogModule} from '../work-log/work-log.module';
import {MockAuthModule} from '../auth/mock-auth.module';
import {CustomerReportController} from './customer-report.controller';
import {CustomerReportService} from './customer-report.service';
import {MongooseModule} from '@nestjs/mongoose';
import {CustomerTokenSchema} from './customer-token.schema';
import {Model} from "mongoose";
import {WorkLog} from "../work-log/work-log.model";
import * as request from "supertest";
import {Test} from "supertest";
import {CustomerToken, CustomerTokenDTO} from "./customer-token.model";

describe('WorkLog Controller', () => {
    let app: INestApplication;
    let mongoServer: MongoMemoryServer;
    let customerReportService: CustomerReportService;
    let workLogModel: Model<WorkLog>;
    let customerTokenModel: Model<CustomerToken>;
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
        workLogModel = module.get('WorkLogModel');
        customerTokenModel = module.get('CustomerTokenModel');
        app = module.createNestApplication();
        customerReportService = module.get('CustomerReportService');
        await app.init();
    });

    afterAll(async () => {
        await app.close();
        await mongoServer.stop();
    });

    describe('POST customer-reports', () => {
        const customerTokenEntries: CustomerTokenDTO[] = [
            {customerName: 'customer', tags: ['old-tag'], token: 'old-token'}
        ];

        beforeEach(async () => {
            await customerTokenModel.create(customerTokenEntries);
        });

        afterEach(async () => {
            await customerTokenModel.deleteMany({});
        });

        it('should fail when no customerName provided', async () => {
            const requestBody = {customerName: '', tags: ['nvm']};

            await postRequestWithRoles(app, `customer-reports`, requestBody, ['ADMIN'])
                .send(requestBody)
                .expect(HttpStatus.BAD_REQUEST);
        });
        it('should fail when no tags provided', async () => {
            const requestBody = {customerName: 'abc', tags: []};

            await postRequestWithRoles(app, `customer-reports`, requestBody, ['ADMIN'])
                .send(requestBody)
                .expect(HttpStatus.BAD_REQUEST);
        });
        it('should return 403 for non-admin user', async () => {
            const requestBody = {customerName: 'newvoicemedia', tags: ['nvm']};

            await postRequestWithRoles(app, `customer-reports`, requestBody, ['USER'])
                .send(requestBody)
                .expect(HttpStatus.FORBIDDEN);
        });
        it('should generate customer token if not already present', async () => {
            const requestBody = {customerName: 'newvoicemedia', tags: ['nvm']};

            const {body: {token}} = await postRequestWithRoles(app, `customer-reports`, requestBody, ['ADMIN'])
                .send(requestBody)
                .expect(HttpStatus.CREATED);

            const tags = await customerReportService.findTagsByCustomerNameAndToken(requestBody.customerName, token).toPromise();
            expect(tags).toEqual(['nvm']);
        });
        it('should update customer token if already present', async () => {
            const requestBody = {customerName: 'customer', tags: ['new-tag']};

            const {body: {token}} = await postRequestWithRoles(app, `customer-reports`, requestBody, ['ADMIN'])
                .send(requestBody)
                .expect(HttpStatus.CREATED);

            const newTags = await customerReportService.findTagsByCustomerNameAndToken(requestBody.customerName, token).toPromise();
            var oldTokenQueryResult: CustomerToken[] = await customerTokenModel.find({customerName: 'customer', tags: ['old-tag']});
            expect(newTags).toEqual(['new-tag']);
            expect(oldTokenQueryResult.length).toEqual(0);
        });
    });

    describe('GET customer-reports', () => {
        const workLogEntries = [
            someWorkLog('2018/01/05', 'john.doe', 480, ['holidays']),
            someWorkLog('2018/01/05', 'nvm.employee1', 480, ['holidays']),
            someWorkLog('2019/01/05', 'james.bond', 480, ['projects', 'syniverse-dsp']),
            someWorkLog('2019/01/06', 'james.bond', 480, ['projects', 'syniverse-dsp']),
            someWorkLog('2019/01/11', 'nvm.employee1', 480, ['projects', 'nvm']),
            someWorkLog('2019/01/14', 'nvm.employee2', 480, ['projects', 'nvm']),
            someWorkLog('2019/01/15', 'nvm.employee3', 480, ['projects', 'nvm', 'boring-stuff'])
        ];

        const customerTokenEntries: CustomerTokenDTO[] = [
            {customerName: 'newvoicemedia', tags: ['nvm', 'nvm2'], token: 'nvm-token'},
            {customerName: 'jeanluisdavid', tags: ['jld'], token: 'jld-token'},
        ];

        beforeEach(async () => {
            await workLogModel.create(workLogEntries);
            await customerTokenModel.create(customerTokenEntries);
        });

        afterEach(async () => {
            await workLogModel.deleteMany({});
            await customerTokenModel.deleteMany({});
        });

        it('should return correct report', async () => {
            const {body: report} = await getCustomerReport('newvoicemedia', 2019, 1, 'nvm-token');

            expect(report.length).toEqual(3);
            report.forEach(entry => expect(entry.projectNames).toContain('nvm'));
        });
        it('should return 404 when token missing for customer ', async () => {
            await getCustomerReport('no-such-customer', 2019, 1, 'some-token').expect(HttpStatus.NOT_FOUND);
        });
        it('should return empty result when no matching entries for the tag', async () => {
            const {body: report} = await getCustomerReport('jeanluisdavid', 2019, 1, 'jld-token');

            expect(report.length).toEqual(0);
        });
    });

    function getCustomerReport(customer, year, month, token): Test {
        return request(app.getHttpServer())
            .get(`/api/v1/customer-reports/${customer}/${year}/${month}`)
            .query({token})
            .send();
    }
});
