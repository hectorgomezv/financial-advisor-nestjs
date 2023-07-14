import { faker } from '@faker-js/faker';
import { PortfolioContribution } from '../portfolio-contribution.entity';
import { PortfolioState } from '../portfolio-state.entity';
import { Portfolio } from '../portfolio.entity';
import { Position } from '../position.entity';
import { portfolioContributionFactory } from './portfolio-contribution.factory';
import { portfolioStateFactory } from './portfolio-state.factory';
import { positionFactory } from './position.factory';

export function portfolioFactory(
  uuid?: string,
  name?: string,
  ownerId?: string,
  created?: number,
  positions?: Position[],
  cash?: number,
  contributions?: PortfolioContribution[],
  state?: PortfolioState,
): Portfolio {
  const portfolioUuid = uuid ?? faker.string.uuid();
  return <Portfolio>{
    uuid: portfolioUuid,
    name: name ?? faker.word.sample(),
    ownerId: ownerId ?? faker.string.uuid(),
    created: created ?? faker.number.int(),
    positions: positions || [positionFactory(), positionFactory()],
    cash: cash ?? Number(faker.finance.amount()),
    contributions: contributions || [
      portfolioContributionFactory(portfolioUuid),
      portfolioContributionFactory(portfolioUuid),
    ],
    state: state || portfolioStateFactory(),
  };
}
