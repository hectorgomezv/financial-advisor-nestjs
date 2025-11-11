import { faker } from '@faker-js/faker';
import { PortfolioContribution } from '../portfolio-contribution.entity';
import { PortfolioState } from '../portfolio-state.entity';
import { Portfolio } from '../portfolio.entity';
import { Position } from '../position.entity';
import { portfolioContributionFactory } from './portfolio-contribution.factory';
import { portfolioStateFactory } from './portfolio-state.factory';
import { positionFactory } from './position.factory';
import Decimal from 'decimal.js';

export function portfolioFactory(
  id?: number,
  name?: string,
  ownerId?: string,
  created?: Date,
  positions?: Array<Position>,
  cash?: Decimal,
  contributions?: Array<PortfolioContribution>,
  state?: PortfolioState,
): Portfolio {
  const portfolioId = id ?? faker.number.int();
  return <Portfolio>{
    id: portfolioId,
    name: name ?? faker.word.sample(),
    ownerId: ownerId ?? faker.string.uuid(),
    created: created ?? faker.date.recent(),
    positions: positions || [positionFactory(), positionFactory()],
    cash: cash ?? new Decimal(faker.finance.amount()),
    contributions: contributions || [
      portfolioContributionFactory(portfolioId),
      portfolioContributionFactory(portfolioId),
    ],
    state: state || portfolioStateFactory(),
  };
}
