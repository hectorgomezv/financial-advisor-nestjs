import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { readFileSync } from 'fs';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module.js';

const { CORS_BASE_URL, HTTP_SERVER_PORT } = process.env;

function getAllowedOrigins(): (string | RegExp)[] {
  const allowedOrigins = [/localhost/];

  return CORS_BASE_URL
    ? [...allowedOrigins, new URL(CORS_BASE_URL).hostname]
    : allowedOrigins;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.useLogger(app.get(Logger));
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.setGlobalPrefix('/api');
  app.enableCors({ origin: getAllowedOrigins() });
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
