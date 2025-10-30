import { faker } from '@faker-js/faker';
import { PortfolioContribution } from '../portfolio-contribution.entity.js';
import { PortfolioState } from '../portfolio-state.entity.js';
import { Portfolio } from '../portfolio.entity.js';
import { Position } from '../position.entity.js';
import { portfolioContributionFactory } from './portfolio-contribution.factory.js';
import { portfolioStateFactory } from './portfolio-state.factory.js';
import { positionFactory } from './position.factory.js';

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
