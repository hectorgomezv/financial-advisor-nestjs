import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { LoggerModule } from 'nestjs-pino';
import { AboutModule } from './about/about.module';
import { JwtStrategy } from './common/auth/jwt.strategy';
import { CommonModule } from './common/common.module';
import { MigrationsRunner } from './common/migrations/migrations-runner';
import { CompaniesModule } from './companies/companies.module';
import { HealthModule } from './health/health.module';
import { IndicesModule } from './indices/indices.module';
import { MetricsModule } from './metrics/metrics.module';
import { PortfoliosModule } from './portfolios/portfolios.module';
import { DbModule } from './common/db.module';

const { NODE_ENV } = process.env;

@Module({
  imports: [
    DbModule,
    ConfigModule.forRoot({
      envFilePath: NODE_ENV ? `.env.${NODE_ENV}` : '.env',
    }),
    LoggerModule.forRoot({
      pinoHttp: { level: NODE_ENV === 'production' ? 'info' : 'debug' },
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
    AboutModule,
    CommonModule,
    CompaniesModule,
    HealthModule,
    IndicesModule,
    MetricsModule,
    PortfoliosModule,
  ],
  providers: [JwtService, JwtStrategy, MigrationsRunner],
})
export class AppModule {}
