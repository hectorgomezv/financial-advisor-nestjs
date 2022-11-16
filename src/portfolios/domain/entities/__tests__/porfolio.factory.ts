import { Portfolio } from '../portfolio.entity';
import { faker } from '@faker-js/faker';
import { Position } from '../position.entity';
import { PortfolioState } from '../portfolio-state.entity';
import { positionFactory } from './position.factory';
import { portfolioStateFactory } from './portfolio-state.factory';
import { PortfolioContribution } from '../portfolio-contribution.entity';
import { portfolioContributionFactory } from './portfolio-contribution.factory';

export function portfolioFactory(
  uuid?: string,
  name?: string,
  created?: number,
  positions?: Position[],
  seed?: number,
  cash?: number,
  contributions?: PortfolioContribution[],
  state?: PortfolioState,
): Portfolio {
  const portfolioUuid = uuid || faker.datatype.uuid();
  return <Portfolio>{
    uuid: portfolioUuid,
    name: name || faker.datatype.uuid(),
    created: created || faker.datatype.number(),
    positions: positions || [positionFactory(), positionFactory()],
    seed: seed || Number(faker.finance.amount()),
    cash: cash || Number(faker.finance.amount()),
    contributions: contributions || [
      portfolioContributionFactory(portfolioUuid),
      portfolioContributionFactory(portfolioUuid),
    ],
    state: state || portfolioStateFactory(),
  };
}
