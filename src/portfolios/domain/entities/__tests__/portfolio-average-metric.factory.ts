import { faker } from '@faker-js/faker';
import { PortfolioAverageBalance } from '../portfolio-average-balanace.entity';

export function portfolioAverageBalanceFactory(
  timestamp?: number,
  average?: number,
): PortfolioAverageBalance {
  return <PortfolioAverageBalance>{
    timestamp: timestamp ?? faker.datatype.number(),
    average: average ?? faker.datatype.number(),
  };
}
