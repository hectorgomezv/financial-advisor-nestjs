import { Maths } from '../../../common/domain/entities/maths.entity';
import { PortfolioContribution as DomainPortfolioContribution } from '../../domain/entities/portfolio-contribution.entity';
import { PortfolioState as DomainPortfolioState } from '../../domain/entities/portfolio-state.entity';
import { Portfolio as DomainPortfolio } from '../../domain/entities/portfolio.entity';
import { Position as DomainPosition } from '../../domain/entities/position.entity';
import { PortfolioContribution } from '../entities/portfolio-contribution.entity';
import { PortfolioState } from '../entities/portfolio-state.entity';
import { PortfolioWithContributions } from '../entities/portfolio-with-contributions.entity';
import { Portfolio } from '../entities/portfolio.entity';
import { Position } from '../entities/position.entity';

export class PortfolioRouteMapper {
  public static mapPortfolio(portfolio: DomainPortfolio): Portfolio {
    return {
      id: portfolio.id,
      cash: portfolio.cash.toString(),
      contributions: portfolio.contributions.map((contribution) =>
        PortfolioRouteMapper.mapContribution(contribution),
      ),
      created: portfolio.created,
      name: portfolio.name,
      ownerId: portfolio.ownerId,
      positions: portfolio.positions.map((position) =>
        PortfolioRouteMapper.mapPosition(position),
      ),
      state: portfolio.state
        ? PortfolioRouteMapper.mapPortfolioState(portfolio.state)
        : null,
    };
  }

  public static mapPortfolioWithContributions(
    portfolio: DomainPortfolio,
  ): PortfolioWithContributions {
    return {
      id: portfolio.id,
      cash: portfolio.cash.toString(),
      contributions: portfolio.contributions.map((contribution) =>
        PortfolioRouteMapper.mapContribution(contribution),
      ),
      created: portfolio.created,
      name: portfolio.name,
      ownerId: portfolio.ownerId,
    };
  }

  public static mapPosition(position: DomainPosition): Position {
    return {
      id: position.id,
      portfolioId: position.portfolioId,
      companyId: position.companyId,
      blocked: position.blocked,
      shares: Maths.round(position.shares),
      sharesUpdatedAt: position.sharesUpdatedAt,
      targetWeight: Maths.round(position.targetWeight),
      value: Maths.round(position.value),
    };
  }

  public static mapContribution(
    contribution: DomainPortfolioContribution,
  ): PortfolioContribution {
    return {
      id: contribution.id,
      portfolioId: contribution.portfolioId,
      amountEUR: Maths.round(contribution.amountEUR),
      timestamp: contribution.timestamp,
    };
  }

  public static mapPortfolioState(state: DomainPortfolioState): PortfolioState {
    return {
      id: state.id,
      portfolioId: state.portfolioId,
      cash: Maths.round(state.cash),
      isValid: state.isValid,
      roicEUR: Maths.round(state.roicEUR),
      sumWeights: Maths.round(state.sumWeights),
      timestamp: state.timestamp,
      totalValueEUR: Maths.round(state.totalValueEUR),
    };
  }
}
