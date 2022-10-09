import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PortfoliosService } from './domain/portfolios.service';
import { PortfoliosController } from './routes/portfolios.controller';
import { PortfoliosRepository } from './repositories/portfolios.repository';
import {
  PortfolioModel,
  PortfolioSchema,
} from './repositories/schemas/portfolio.schema';
import { PortfolioStatesRepository } from './repositories/portfolio-states.repository';
import {
  PortfolioStateModel,
  PortfolioStateSchema,
} from './repositories/schemas/portfolio-state.schema';
import { PositionsService } from './domain/positions.service';
import {
  PositionModel,
  PositionSchema,
} from './repositories/schemas/position.schema';
import { PositionsRepository } from './repositories/positions.repository';
import { CompaniesModule } from '../companies/companies.module';
import { CurrencyExchangeClient } from './datasources/currency-exchange.client';
import { PortfolioStatesService } from './domain/portfolio-states.service';
import { ConfigModule } from '@nestjs/config';
import { OpenExchangeRatesClient } from './datasources/open-exchange-rates.client';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    MongooseModule.forFeature([
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
    CurrencyExchangeClient,
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
