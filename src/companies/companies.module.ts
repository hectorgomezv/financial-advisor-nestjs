import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from '../common/auth/auth-service.js';
import { RedisClient } from '../common/cache/redis.client.js';
import { PortfoliosModule } from '../portfolios/portfolios.module.js';
import { IFinancialDataClient } from './datasources/financial-data.client.interface.js';
import { YahooFinancialDataClient } from './datasources/yahoo-financial-data.client.js';
import { CompaniesService } from './domain/companies.service.js';
import { CompanyStatesService } from './domain/company-states.service.js';
import { CompaniesRepository } from './repositories/companies.repository.js';
import { CompanyStatesRepository } from './repositories/company-states.repository.js';
import {
  CompanyStateModel,
  CompanyStateSchema,
} from './repositories/schemas/company-state.schema.js';
import {
  CompanyModel,
  CompanySchema,
} from './repositories/schemas/company.schema.js';
import { CompaniesController } from './routes/companies.controller.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CompanyModel.name, schema: CompanySchema },
      { name: CompanyStateModel.name, schema: CompanyStateSchema },
    ]),
    ConfigModule,
    HttpModule,
    forwardRef(() => PortfoliosModule),
  ],
  controllers: [CompaniesController],
  providers: [
    { provide: IFinancialDataClient, useClass: YahooFinancialDataClient },
    AuthService,
    CompaniesRepository,
    CompaniesService,
    CompanyStatesRepository,
    CompanyStatesService,
    RedisClient,
  ],
  exports: [CompaniesRepository, CompanyStatesRepository],
})
export class CompaniesModule {}
