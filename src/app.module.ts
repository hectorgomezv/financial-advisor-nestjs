import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { LoggerMiddleware } from './logger.middleware';
import { CompaniesModule } from './companies/companies.module';
import { MongooseModule } from '@nestjs/mongoose';
import { HealthModule } from './health/health.module';
import { MetricsController } from './metrics/routes/metrics.controller';
import { MetricsService } from './metrics/domain/metrics.service';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/financialAdvisorDB'),
    CompaniesModule,
    HealthModule,
  ],
  controllers: [MetricsController],
  providers: [MetricsService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes(CompaniesModule);
  }
}
