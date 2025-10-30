import { Injectable } from '@nestjs/common';
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { TimePeriod } from '../../common/domain/entities/time-period.entity.js';
import { PortfolioStatesRepository } from '../repositories/portfolio-states.repository.js';
import { PortfolioAverageBalance } from './entities/portfolio-average-balance.entity.js';
import { PortfolioState } from './entities/portfolio-state.entity.js';
import { Portfolio } from './entities/portfolio.entity.js';
import { Position } from './entities/position.entity.js';
import { TimeRange } from './entities/time-range.enum.js';
const { round } = _;

@Injectable()
export class PortfolioStatesService {
  constructor(private readonly repository: PortfolioStatesRepository) {}

  async createPortfolioState(portfolio: Portfolio, positions: Position[]) {
    const sumWeights = round(
      positions.reduce((acc, p) => acc + p.targetWeight, 0),
      2,
    );
    const cash = portfolio.cash ?? 0;
    const totalValueEUR = positions.reduce((sum, pos) => sum + pos.value, cash);
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
      isValid: sumWeights === 100,
      sumWeights,
      cash,
      totalValueEUR,
      roicEUR: totalValueEUR - contributionsAmount,
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
}
