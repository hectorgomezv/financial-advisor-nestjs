import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { VersioningType } from '@nestjs/common';

const { HTTP_SERVER_PORT } = process.env;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('/api');
  app.enableVersioning({
    type: VersioningType.URI,
  });

  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Financial Advisor')
      .setDescription('Nest.js Financial Advisor implementation')
      .setVersion('0.0.6')
      .build(),
  );
  SwaggerModule.setup('api', app, document);

  await app.listen(Number(HTTP_SERVER_PORT) || 3000);
}
bootstrap();
