import { faker } from '@faker-js/faker';
import { PortfolioAverageBalance } from '../portfolio-average-balance.entity';

export function portfolioAverageBalanceFactory(
  timestamp?: number,
  average?: number,
  contributions?: number,
): PortfolioAverageBalance {
  return <PortfolioAverageBalance>{
    timestamp: timestamp ?? faker.datatype.number(),
    average: average ?? faker.datatype.number(),
    contributions: contributions ?? faker.datatype.number(),
  };
}
