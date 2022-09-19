import { Module } from '@nestjs/common';
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

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PortfolioModel.name, schema: PortfolioSchema },
      { name: PortfolioStateModel.name, schema: PortfolioStateSchema },
    ]),
  ],
  controllers: [PortfoliosController],
  providers: [
    PortfoliosService,
    PortfoliosRepository,
    PortfolioStatesRepository,
  ],
})
export class PortfoliosModule {}
