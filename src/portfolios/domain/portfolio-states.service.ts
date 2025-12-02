import { Injectable } from '@nestjs/common';
import Decimal from 'decimal.js';
import { TimePeriod } from '../../common/domain/entities/time-period.entity';
import { PortfolioStatesRepository } from '../repositories/portfolio-states.repository';
import { PositionWithCompanyState } from './dto/position-with-company-state.dto';
import { PortfolioAverageBalance } from './entities/portfolio-average-balance.entity';
import { PortfolioState } from './entities/portfolio-state.entity';
import { Portfolio } from './entities/portfolio.entity';
import { Position } from './entities/position.entity';
import { TimeRange } from './entities/time-range.enum';

@Injectable()
export class PortfolioStatesService {
  constructor(private readonly repository: PortfolioStatesRepository) {}

  async createPortfolioState(
    portfolio: Portfolio,
    positions: Array<Position> | Array<PositionWithCompanyState>,
  ): Promise<PortfolioState> {
    const sumWeights = positions.reduce(
      (acc, p) => acc.plus(p.targetWeight),
      new Decimal(0),
    );
    const totalValueEUR = positions.reduce(
      (sum, pos) => sum.plus(pos.value),
      portfolio.cash,
    );
    const contributionsAmount = portfolio.contributions.reduce(
      (sum, contribution) => sum.plus(contribution.amountEUR),
      new Decimal(0),
    );
    return this.repository.create({
      portfolioId: portfolio.id,
      cash: portfolio.cash,
      isValid: sumWeights.equals(100),
      roicEUR: totalValueEUR.minus(contributionsAmount),
      sumWeights,
      timestamp: new Date(),
      totalValueEUR,
    });
  }

  getLastByPortfolioId(portfolioId: number): Promise<PortfolioState> {
    return this.repository.getLastByPortfolioId(portfolioId);
  }

  getAverageBalancesForRange(
    portfolioId: number,
    range: TimeRange,
  ): Promise<Partial<PortfolioAverageBalance>[]> {
    return this.repository.getAverageBalancesForRange(portfolioId, range);
  }

  getPortfolioStatesInPeriod(
    portfolioId: number,
    period: TimePeriod,
  ): Promise<Partial<PortfolioState>[]> {
    return this.repository.getPortfolioStatesInPeriod(portfolioId, period);
  }
}
