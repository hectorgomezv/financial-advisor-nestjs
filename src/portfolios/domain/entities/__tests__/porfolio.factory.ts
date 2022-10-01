import { Portfolio } from '../portfolio.entity';
import { faker } from '@faker-js/faker';
import { Position } from '../position.entity';
import { PortfolioState } from '../portfolio-state.entity';
import { positionFactory } from './position.factory';
import { portfolioStateFactory } from './portfolio-state.factory';

export function portfolioFactory(
  uuid?: string,
  name?: string,
  created?: number,
  positions?: Position[],
  state?: PortfolioState,
): Portfolio {
  return <Portfolio>{
    uuid: uuid || faker.datatype.uuid(),
    name: name || faker.datatype.uuid(),
    created: created || faker.datatype.number(),
    positions: positions || [positionFactory(), positionFactory()],
    state: state || portfolioStateFactory(),
  };
}
