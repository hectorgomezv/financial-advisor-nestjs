import { faker } from '@faker-js/faker';
import { PortfolioPerformance } from '../portfolio-performance.entity';

export function portfolioPerformanceFactory(
  timestamp?: number,
  value?: number,
): PortfolioPerformance {
  return <PortfolioPerformance>{
    timestamp: timestamp ?? faker.datatype.number(),
    value: value ?? faker.datatype.number(),
  };
}
