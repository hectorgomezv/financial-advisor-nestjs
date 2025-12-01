import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { LoggerModule } from 'nestjs-pino';
import { AboutModule } from './about/about.module';
import { JwtStrategy } from './common/auth/jwt.strategy';
import { CommonModule } from './common/common.module';
import { DbModule } from './common/db.module';
import { CompaniesModule } from './companies/companies.module';
import { HealthModule } from './health/health.module';
import { IndicesModule } from './indices/indices.module';
import { MetricsModule } from './metrics/metrics.module';
import { PortfoliosModule } from './portfolios/portfolios.module';

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
    ScheduleModule.forRoot(),
    AboutModule,
    CommonModule,
    CompaniesModule,
    HealthModule,
    IndicesModule,
    MetricsModule,
    PortfoliosModule,
  ],
  providers: [JwtService, JwtStrategy],
})
export class AppModule {}
