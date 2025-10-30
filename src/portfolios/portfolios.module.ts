import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from '../common/auth/auth-service.js';
import { CompaniesModule } from '../companies/companies.module.js';
import { IFinancialDataClient } from '../companies/datasources/financial-data.client.interface.js';
import { YahooFinancialDataClient } from '../companies/datasources/yahoo-financial-data.client.js';
import { IndicesService } from '../indices/domain/indices.service.js';
import { IndicesRepository } from '../indices/repositories/indices.repository.js';
import {
  IndexModel,
  IndexSchema,
} from '../indices/repositories/schemas/index.schema.js';
import { CurrencyExchangeClient } from './datasources/currency-exchange.client.js';
import { OpenExchangeRatesClient } from './datasources/open-exchange-rates.client.js';
import { PortfolioStatesService } from './domain/portfolio-states.service.js';
import { PortfoliosService } from './domain/portfolios.service.js';
import { PositionsService } from './domain/positions.service.js';
import { PortfolioStatesRepository } from './repositories/portfolio-states.repository.js';
import { PortfoliosRepository } from './repositories/portfolios.repository.js';
import { PositionsRepository } from './repositories/positions.repository.js';
import {
  PortfolioStateModel,
  PortfolioStateSchema,
} from './repositories/schemas/portfolio-state.schema.js';
import {
  PortfolioModel,
  PortfolioSchema,
} from './repositories/schemas/portfolio.schema.js';
import {
  PositionModel,
  PositionSchema,
} from './repositories/schemas/position.schema.js';
import { PortfoliosController } from './routes/portfolios.controller.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: IndexModel.name, schema: IndexSchema },
      { name: PortfolioModel.name, schema: PortfolioSchema },
      { name: PortfolioStateModel.name, schema: PortfolioStateSchema },
      { name: PositionModel.name, schema: PositionSchema },
    ]),
    ConfigModule,
    HttpModule,
    forwardRef(() => CompaniesModule),
  ],
  controllers: [PortfoliosController],
  providers: [
    { provide: IFinancialDataClient, useClass: YahooFinancialDataClient },
    AuthService,
    CurrencyExchangeClient,
    IndicesRepository,
    IndicesService,
    OpenExchangeRatesClient,
    PortfoliosRepository,
    PortfoliosService,
    PortfolioStatesRepository,
    PortfolioStatesService,
    PositionsRepository,
    PositionsService,
  ],
  exports: [PositionsRepository],
})
export class PortfoliosModule {}
