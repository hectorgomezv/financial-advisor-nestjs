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
import { CompaniesPgRepository } from './repositories/companies.pg.repository';
import { PgMigrator } from '../common/pg.migrator';
import { DbModule } from '../common/db.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CompanyModel.name, schema: CompanySchema },
      { name: CompanyStateModel.name, schema: CompanyStateSchema },
    ]),
    ConfigModule,
    DbModule,
    HttpModule,
    forwardRef(() => PortfoliosModule),
  ],
  controllers: [CompaniesController],
  providers: [
    AuthService,
    CompaniesPgRepository,
    CompaniesRepository,
    CompaniesService,
    CompanyStatesRepository,
    CompanyStatesService,
    RedisClient,
    { provide: IFinancialDataClient, useClass: YahooFinancialDataClient },
  ],
  exports: [
    CompaniesPgRepository,
    CompaniesRepository,
    CompanyStatesRepository,
  ],
})
export class CompaniesModule {}
