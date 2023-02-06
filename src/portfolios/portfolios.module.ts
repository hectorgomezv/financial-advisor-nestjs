import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from '../common/auth/auth-service';
import { CompaniesModule } from '../companies/companies.module';
import { IFinancialDataClient } from '../companies/datasources/financial-data.client.interface';
import { YahooFinancialDataClient } from '../companies/datasources/yahoo-financial-data.client';
import { IndicesService } from '../indices/domain/indices.service';
import { IndicesRepository } from '../indices/repositories/indices.repository';
import {
  IndexModel,
  IndexSchema,
} from '../indices/repositories/schemas/index.schema';
import { CurrencyExchangeClient } from './datasources/currency-exchange.client';
import { OpenExchangeRatesClient } from './datasources/open-exchange-rates.client';
import { PortfolioStatesService } from './domain/portfolio-states.service';
import { PortfoliosService } from './domain/portfolios.service';
import { PositionsService } from './domain/positions.service';
import { PortfolioStatesRepository } from './repositories/portfolio-states.repository';
import { PortfoliosRepository } from './repositories/portfolios.repository';
import { PositionsRepository } from './repositories/positions.repository';
import {
  PortfolioStateModel,
  PortfolioStateSchema,
} from './repositories/schemas/portfolio-state.schema';
import {
  PortfolioModel,
  PortfolioSchema,
} from './repositories/schemas/portfolio.schema';
import {
  PositionModel,
  PositionSchema,
} from './repositories/schemas/position.schema';
import { PortfoliosController } from './routes/portfolios.controller';

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
