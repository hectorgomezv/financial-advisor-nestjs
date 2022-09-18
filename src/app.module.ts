import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { LoggerMiddleware } from './logger.middleware';
import { CompaniesModule } from './companies/companies.module';
import { MongooseModule } from '@nestjs/mongoose';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/financialAdvisorDB'),
    CompaniesModule,
    HealthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes(CompaniesModule);
  }
}
