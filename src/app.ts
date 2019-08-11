import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

declare const module: any;

const BASE_PATH = 'api/v1';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.setGlobalPrefix(BASE_PATH);

  const options = new DocumentBuilder()
    .setTitle('OpenTrappJs')
    .setDescription('OpenTrapp API description')
    .setVersion('1.0')
    .addTag('admin-work-log')
    .addTag('admin-accounts')
    .addTag('authentication')
    .addTag('calendar')
    .addTag('employee')
    .addTag('project')
    .addBearerAuth('Authorization', 'header', 'apiKey')
    .setSchemes('https', 'http')
    .setBasePath(BASE_PATH)
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('swagger', app, document);
  const port = process.env.PORT || 3000;
  await app.listen(port);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}

bootstrap();
