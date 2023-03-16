import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { TimePeriod } from '../../common/domain/entities/time-period.entity';
import { CurrencyExchangeClient } from '../datasources/currency-exchange.client';
import { PortfolioStatesRepository } from '../repositories/portfolio-states.repository';
import { PortfolioAverageBalance } from './entities/portfolio-average-balance.entity';
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
    const cash = portfolio.cash ?? 0;
    const contributionsAmount = portfolio.contributions
      ? portfolio.contributions.reduce(
          (sum, contribution) => sum + contribution.amountEUR,
          0,
        )
      : 0;

    return this.repository.create(<PortfolioState>{
      uuid: uuidv4(),
      timestamp: new Date(),
      portfolioUuid: portfolio.uuid,
      isValid,
      sumWeights,
      cash,
      totalValueEUR,
      roicEUR: totalValueEUR + cash - contributionsAmount,
    });
  }

  getLastByPortfolioUuid(portfolioUuid: string): Promise<PortfolioState> {
    return this.repository.getLastByPortfolioUuid(portfolioUuid);
  }

  getAverageBalancesForRange(
    portfolioUuid: string,
    range: TimeRange,
  ): Promise<Partial<PortfolioAverageBalance>[]> {
    return this.repository.getAverageBalancesForRange(portfolioUuid, range);
  }

  getPortfolioStatesInPeriod(
    portfolioUuid: string,
    period: TimePeriod,
  ): Promise<Partial<PortfolioState>[]> {
    return this.repository.getPortfolioStatesInPeriod(portfolioUuid, period);
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
