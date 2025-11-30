import { faker } from '@faker-js/faker';
import { PortfolioStateResult } from '../portfolio-state-result.entity';

export function portfolioStateResultFactory(
  id?: number,
  timestamp?: Date,
  portfolioId?: number,
  isValid?: boolean,
  sumWeights?: string,
  totalValueEUR?: string,
  roicEUR?: string,
): PortfolioStateResult {
  return <PortfolioStateResult>{
    id: id ?? faker.number.int(),
    portfolioId: portfolioId ?? faker.number.int(),
    timestamp: timestamp ?? faker.date.recent(),
    isValid: isValid ?? faker.datatype.boolean(),
    sumWeights: sumWeights ?? faker.number.int().toString(),
    totalValueEUR: totalValueEUR ?? faker.number.int().toString(),
    roicEUR: roicEUR ?? faker.number.int().toString(),
  };
}
