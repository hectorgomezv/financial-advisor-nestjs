import { faker } from '@faker-js/faker';
import { PortfolioAverageBalance } from '../portfolio-average-balance.entity';

export function portfolioAverageBalanceFactory(
  timestamp?: Date,
  average?: number,
  contributions?: number,
): PortfolioAverageBalance {
  return <PortfolioAverageBalance>{
    timestamp: timestamp ?? faker.date.recent(),
    average: average ?? faker.datatype.number(),
    contributions: contributions ?? faker.datatype.number(),
  };
}
