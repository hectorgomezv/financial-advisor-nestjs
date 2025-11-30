import { faker } from '@faker-js/faker';
import Decimal from 'decimal.js';
import { PortfolioAverageBalance } from '../portfolio-average-balance.entity';

export function portfolioAverageBalanceFactory(
  timestamp?: Date,
  average?: Decimal,
  contributions?: Decimal,
): PortfolioAverageBalance {
  return <PortfolioAverageBalance>{
    timestamp: timestamp ?? faker.date.recent(),
    average: average ?? new Decimal(faker.number.int()),
    contributions: contributions ?? new Decimal(faker.number.int()),
  };
}
