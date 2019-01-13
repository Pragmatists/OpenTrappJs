import { v4 as uuid } from 'uuid';
import { ModuleMetadata } from '@nestjs/common/interfaces';
import { Test } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import MongoMemoryServer from 'mongodb-memory-server';

export function someWorkLog(date: string, employee: string, workload: number, tags: string[], note?: string) {
  return {
    _id: {
      _id: `WL.${uuid()}`
    },
    day: {
      date
    },
    employeeID: {
      _id: employee
    },
    projectNames: tags.map(t => ({name: t})),
    workload: {
      minutes: workload
    },
    note: {
      text: note
    },
    createdAt: new Date()
  };
}

export async function testModuleWithInMemoryDb(moduleMetadata: ModuleMetadata) {
  const mongoServer = new MongoMemoryServer();
  const uri = await mongoServer.getConnectionString();
  const module = await Test.createTestingModule({
    ...moduleMetadata,
    imports: [
      ...moduleMetadata.imports,
      MongooseModule.forRoot(uri, {useNewUrlParser: true})
    ]
  }).compile();
  return {
    module,
    mongoServer
  };
}
