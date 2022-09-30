import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CurrencyExchangeClient } from '../datasources/currency-exchange.client';
import { PortfolioStatesRepository } from '../repositories/portfolio-states.repository';
import { PortfolioAverageMetric } from './entities/portfolio-average-metric.entity';
import { PortfolioState } from './entities/portfolio-state.entity';
import { Position } from './entities/position.entity';
import { TimeRange } from './entities/time-range.enum';

@Injectable()
export class PortfolioStatesService {
  constructor(
    private readonly repository: PortfolioStatesRepository,
    private readonly exchangeClient: CurrencyExchangeClient,
  ) {}

  async createPortfolioState(portfolioUuid: string, positions: Position[]) {
    const sumWeights = positions.reduce(
      (acc, pos) => acc + pos.targetWeight,
      0,
    );
    const isValid = sumWeights === 100;
    const totalValueEUR = await this.getTotalValueEUR(positions);

    return this.repository.create(<PortfolioState>{
      uuid: uuidv4(),
      timestamp: Date.now(),
      portfolioUuid,
      isValid,
      sumWeights,
      totalValueEUR,
    });
  }

  getLastByPortfolioUuid(portfolioUuid: string): Promise<PortfolioState> {
    return this.repository.getLastByPortfolioUuid(portfolioUuid);
  }

  getSeriesForRange(
    uuid: string,
    range: TimeRange,
  ): Promise<PortfolioAverageMetric[]> {
    return this.repository.getSeriesForRange(uuid, range);
  }

  deleteByPortfolioUuid(portfolioUuid: string): Promise<void> {
    return this.repository.deleteByPortfolioUuid(portfolioUuid);
  }

  private async getTotalValueEUR(positions: Position[]) {
    const fx = await this.exchangeClient.getFx();
    const totalValueUSD = positions.reduce((acc, pos) => acc + pos.value, 0);

    return fx(totalValueUSD).from('USD').to('EUR');
  }
}
