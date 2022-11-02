import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { readFileSync } from 'fs';
import { AppModule } from './app.module';
import { VersioningType } from '@nestjs/common';

const { HTTP_SERVER_PORT } = process.env;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('/api');
  app.enableShutdownHooks();
  app.enableVersioning({
    type: VersioningType.URI,
  });

  const { version } = JSON.parse(
    readFileSync('package.json', { encoding: 'utf-8' }),
  );

  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Financial Advisor')
      .setDescription('Nest.js Financial Advisor implementation')
      .setVersion(version ?? '')
      .build(),
  );
  SwaggerModule.setup('api', app, document);

  await app.listen(Number(HTTP_SERVER_PORT) || 3000);
}
bootstrap();
