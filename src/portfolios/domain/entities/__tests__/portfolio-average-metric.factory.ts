import { faker } from '@faker-js/faker';
import { PortfolioAverageBalance } from '../portfolio-average-balance.entity';

export function portfolioAverageBalanceFactory(
  timestamp?: Date,
  average?: number,
  contributions?: number,
): PortfolioAverageBalance {
  return <PortfolioAverageBalance>{
    timestamp: timestamp ?? faker.date.recent(),
    average: average ?? faker.number.int(),
    contributions: contributions ?? faker.number.int(),
  };
}
