import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const { FINANCIAL_ADVISOR_NESTJS_HTTP_SERVER_PORT, HTTP_SERVER_PORT } =
  process.env;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('/api/v1');
  await app.listen(
    Number(FINANCIAL_ADVISOR_NESTJS_HTTP_SERVER_PORT) ||
      Number(HTTP_SERVER_PORT) ||
      3000,
  );
}
bootstrap();
