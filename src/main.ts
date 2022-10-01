import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const { HTTP_SERVER_PORT } = process.env;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('/api/v1');
  await app.listen(Number(HTTP_SERVER_PORT) || 3000);
}
bootstrap();
