import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { TimePeriod } from '../../common/domain/entities/time-period.entity';
import { PortfolioStatesRepository } from '../repositories/portfolio-states.repository';
import { PortfolioAverageBalance } from './entities/portfolio-average-balance.entity';
import { PortfolioState } from './entities/portfolio-state.entity';
import { Portfolio } from './entities/portfolio.entity';
import { Position } from './entities/position.entity';
import { TimeRange } from './entities/time-range.enum';
import { round } from 'lodash';

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
      portfolioUuid: portfolio.uuid,
      cash,
      isValid: sumWeights === 100,
      roicEUR: totalValueEUR - contributionsAmount,
      sumWeights,
      timestamp: new Date(),
      totalValueEUR,
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
