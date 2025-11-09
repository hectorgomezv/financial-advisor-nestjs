import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CompanyStateModel,
  CompanyStateSchema,
} from '../companies/repositories/schemas/company-state.schema';
import {
  CompanyModel,
  CompanySchema,
} from '../companies/repositories/schemas/company.schema';
import {
  IndexModel,
  IndexSchema,
} from '../indices/repositories/schemas/index.schema';
import {
  PortfolioStateModel,
  PortfolioStateSchema,
} from '../portfolios/repositories/schemas/portfolio-state.schema';
import {
  PortfolioModel,
  PortfolioSchema,
} from '../portfolios/repositories/schemas/portfolio.schema';
import { DbModule } from './db.module';
import {
  DataPointModel,
  DataPointSchema,
} from './domain/schemas/data-point.schema';
import { PgMigrator } from './pg.migrator';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DataPointModel.name, schema: DataPointSchema },
      // TODO: Remove after db migration
      { name: CompanyModel.name, schema: CompanySchema },
      { name: CompanyStateModel.name, schema: CompanyStateSchema },
      { name: IndexModel.name, schema: IndexSchema },
      { name: PortfolioModel.name, schema: PortfolioSchema },
      { name: PortfolioStateModel.name, schema: PortfolioStateSchema },
    ]),
    ConfigModule,
    HttpModule,
    DbModule,
  ],
  controllers: [],
  providers: [PgMigrator],
  exports: [],
})
export class CommonModule {}
