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
import { CompaniesPgRepository } from './repositories/companies.pg.repository';
import { CompanyStatesPgRepository } from './repositories/company-states.pg.repository';
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
    CompaniesPgRepository,
    CompaniesService,
    CompanyStatesPgRepository,
    CompanyStatesService,
    RedisClient,
    { provide: IFinancialDataClient, useClass: YahooFinancialDataClient },
  ],
  exports: [CompaniesPgRepository, CompanyStatesPgRepository],
})
export class CompaniesModule {}
