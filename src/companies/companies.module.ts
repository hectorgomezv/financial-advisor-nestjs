import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from '../common/auth/auth-service';
import { RedisClient } from '../common/cache/redis.client';
import { PortfoliosModule } from '../portfolios/portfolios.module';
import { IFinancialDataClient } from './datasources/financial-data.client.interface';
import { YahooFinancialDataClient } from './datasources/yahoo-financial-data.client';
import { CompaniesService } from './domain/companies.service';
import { CompanyStatesService } from './domain/company-states.service';
import { CompaniesRepository } from './repositories/companies.repository';
import { CompanyStatesRepository } from './repositories/company-states.repository';
import {
  CompanyStateModel,
  CompanyStateSchema,
} from './repositories/schemas/company-state.schema';
import {
  CompanyModel,
  CompanySchema,
} from './repositories/schemas/company.schema';
import { CompaniesController } from './routes/companies.controller';

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
