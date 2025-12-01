import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from '../common/auth/auth-service';
import { RedisClient } from '../common/cache/redis.client';
import { DbModule } from '../common/db.module';
import { PortfoliosModule } from '../portfolios/portfolios.module';
import { IFinancialDataClient } from './datasources/financial-data.client.interface';
import { YahooFinancialDataClient } from './datasources/yahoo-financial-data.client';
import { CompaniesService } from './domain/companies.service';
import { CompanyStatesService } from './domain/company-states.service';
import { CompaniesRepository } from './repositories/companies.repository';
import { CompanyStatesRepository } from './repositories/company-states.repository';
import { CompaniesController } from './routes/companies.controller';

@Module({
  imports: [
    ConfigModule,
    DbModule,
    HttpModule,
    forwardRef(() => PortfoliosModule),
  ],
  controllers: [CompaniesController],
  providers: [
    AuthService,
    CompaniesRepository,
    CompaniesService,
    CompanyStatesRepository,
    CompanyStatesService,
    RedisClient,
    { provide: IFinancialDataClient, useClass: YahooFinancialDataClient },
  ],
  exports: [CompaniesRepository, CompanyStatesRepository],
})
export class CompaniesModule {}
