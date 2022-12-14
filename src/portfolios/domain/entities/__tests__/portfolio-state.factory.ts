import { PortfolioState } from '../portfolio-state.entity';
import { faker } from '@faker-js/faker';

export function portfolioStateFactory(
  uuid?: string,
  timestamp?: number,
  portfolioUuid?: string,
  isValid?: boolean,
  sumWeights?: number,
  totalValueEUR?: number,
  roicEUR?: number,
): PortfolioState {
  return <PortfolioState>{
    uuid: uuid || faker.datatype.uuid(),
    portfolioUuid: portfolioUuid || faker.datatype.uuid(),
    timestamp: timestamp || faker.datatype.number(),
    isValid: isValid || faker.datatype.boolean(),
    sumWeights: sumWeights || faker.datatype.number(),
    totalValueEUR: totalValueEUR || faker.datatype.number(),
    roicEUR: roicEUR || faker.datatype.number(),
  };
}
