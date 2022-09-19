import { Module } from '@nestjs/common';
import { PortfoliosService } from './domain/portfolios.service';
import { PortfoliosController } from './routes/portfolios.controller';

@Module({
  controllers: [PortfoliosController],
  providers: [PortfoliosService],
})
export class PortfoliosModule {}
