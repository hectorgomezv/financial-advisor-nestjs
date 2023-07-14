import { faker } from '@faker-js/faker';
import { PortfolioState } from '../portfolio-state.entity';

export function portfolioStateFactory(
  uuid?: string,
  timestamp?: Date,
  portfolioUuid?: string,
  isValid?: boolean,
  sumWeights?: number,
  totalValueEUR?: number,
  roicEUR?: number,
): PortfolioState {
  return <PortfolioState>{
    uuid: uuid ?? faker.string.uuid(),
    portfolioUuid: portfolioUuid ?? faker.string.uuid(),
    timestamp: timestamp ?? faker.date.recent(),
    isValid: isValid ?? faker.datatype.boolean(),
    sumWeights: sumWeights ?? faker.number.int(),
    totalValueEUR: totalValueEUR ?? faker.number.int(),
    roicEUR: roicEUR ?? faker.number.int(),
  };
}
