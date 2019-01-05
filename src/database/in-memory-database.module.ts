import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import MongoMemoryServer from 'mongodb-memory-server';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: async () => {
        const mongoServer = new MongoMemoryServer();
        const uri = await mongoServer.getConnectionString();
        return {uri};
      }
    })
  ]
})
export class InMemoryDatabaseModule {

}
