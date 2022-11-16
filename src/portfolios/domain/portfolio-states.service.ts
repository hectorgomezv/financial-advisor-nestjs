import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CurrencyExchangeClient } from '../datasources/currency-exchange.client';
import { PortfolioStatesRepository } from '../repositories/portfolio-states.repository';
import { PortfolioAverageBalance } from './entities/portfolio-average-balanace.entity';
import { PortfolioState } from './entities/portfolio-state.entity';
import { Portfolio } from './entities/portfolio.entity';
import { Position } from './entities/position.entity';
import { TimeRange } from './entities/time-range.enum';

@Injectable()
export class PortfolioStatesService {
  constructor(
    private readonly repository: PortfolioStatesRepository,
    private readonly exchangeClient: CurrencyExchangeClient,
  ) {}

  async createPortfolioState(portfolio: Portfolio, positions: Position[]) {
    const sumWeights = positions.reduce(
      (acc, pos) => acc + pos.targetWeight,
      0,
    );
    const isValid = sumWeights === 100;
    const totalValueEUR = await this.getTotalValueEUR(positions);
    const contributionsAmount = portfolio.contributions.reduce(
      (sum, contribution) => sum + contribution.amountEUR,
      0,
    );

    return this.repository.create(<PortfolioState>{
      uuid: uuidv4(),
      timestamp: Date.now(),
      portfolioUuid: portfolio.uuid,
      isValid,
      sumWeights,
      totalValueEUR,
      roicEUR:
        totalValueEUR + portfolio.cash - (portfolio.seed + contributionsAmount),
    });
  }

  getLastByPortfolioUuid(portfolioUuid: string): Promise<PortfolioState> {
    return this.repository.getLastByPortfolioUuid(portfolioUuid);
  }

  getAverageBalancesForRange(
    uuid: string,
    range: TimeRange,
  ): Promise<PortfolioAverageBalance[]> {
    return this.repository.getAverageBalancesForRange(uuid, range);
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
