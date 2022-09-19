import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PortfoliosService } from './domain/portfolios.service';
import { PortfoliosController } from './routes/portfolios.controller';
import { PortfoliosRepository } from './repositories/portfolios.repository';
import {
  PortfolioModel,
  PortfolioSchema,
} from './repositories/schemas/portfolio.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PortfolioModel.name, schema: PortfolioSchema },
    ]),
  ],
  controllers: [PortfoliosController],
  providers: [PortfoliosService, PortfoliosRepository],
})
export class PortfoliosModule {}
