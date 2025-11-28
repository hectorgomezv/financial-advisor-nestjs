import { faker } from '@faker-js/faker';
import { PortfolioState } from '../portfolio-state.entity';
import Decimal from 'decimal.js';

export function portfolioStateFactory(
  id?: number,
  timestamp?: Date,
  portfolioId?: number,
  isValid?: boolean,
  sumWeights?: Decimal,
  totalValueEUR?: Decimal,
  roicEUR?: Decimal,
  cash?: Decimal,
): PortfolioState {
  return <PortfolioState>{
    id: id ?? faker.number.int(),
    portfolioId: portfolioId ?? faker.number.int(),
    timestamp: timestamp ?? faker.date.recent(),
    isValid: isValid ?? faker.datatype.boolean(),
    sumWeights: sumWeights ?? new Decimal(faker.number.int()),
    totalValueEUR: totalValueEUR ?? new Decimal(faker.number.int()),
    roicEUR: roicEUR ?? new Decimal(faker.number.int()),
    cash: cash ?? new Decimal(faker.number.int()),
  };
}
