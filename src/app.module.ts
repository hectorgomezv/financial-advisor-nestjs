import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { MongooseModule } from '@nestjs/mongoose';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { CompaniesModule } from './companies/companies.module';
import { HealthModule } from './health/health.module';
import { MetricsModule } from './metrics/metrics.module';
import { PortfoliosModule } from './portfolios/portfolios.module';
import { JwtStrategy } from './common/auth/jwt.strategy';
import { JwtService } from '@nestjs/jwt';

const { NODE_ENV } = process.env;

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: NODE_ENV ? `.env.${NODE_ENV}` : '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        return {
          uri: `${config.get<string>(
            'MONGO_CONNECTION_STRING',
          )}/${config.get<string>('MONGO_DATABASE_NAME')}`,
        };
      },
    }),
    ScheduleModule.forRoot(),
    CompaniesModule,
    HealthModule,
    MetricsModule,
    PortfoliosModule,
  ],
  providers: [JwtService, JwtStrategy],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
