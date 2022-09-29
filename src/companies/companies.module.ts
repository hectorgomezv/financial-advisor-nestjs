import { Module } from '@nestjs/common';
import { CompaniesService } from './domain/companies.service';
import { CompaniesController } from './routes/companies.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CompaniesRepository } from './repositories/companies.repository';
import {
  CompanyModel,
  CompanySchema,
} from './repositories/schemas/company.schema';
import { CompanyStatesRepository } from './repositories/company-states.repository';
import {
  CompanyStateModel,
  CompanyStateSchema,
} from './repositories/schemas/company-state.schema';
import { HttpModule } from '@nestjs/axios';
import { YahooFinancialDataClient } from './datasources/yahoo-financial-data.client';
import { ConfigModule } from '@nestjs/config';
import { IFinancialDataClient } from './datasources/financial-data.client.interface';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CompanyModel.name, schema: CompanySchema },
      { name: CompanyStateModel.name, schema: CompanyStateSchema },
    ]),
    ConfigModule,
    HttpModule,
  ],
  controllers: [CompaniesController],
  providers: [
    CompaniesService,
    CompaniesRepository,
    CompanyStatesRepository,
    { provide: IFinancialDataClient, useClass: YahooFinancialDataClient },
  ],
  exports: [CompaniesRepository, CompanyStatesRepository],
})
export class CompaniesModule {}
