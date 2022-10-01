import { faker } from '@faker-js/faker';
import { PortfolioAverageMetric } from '../portfolio-average-metric.entity';

export function portfolioAverageMetricFactory(
  timestamp?: number,
  average?: number,
): PortfolioAverageMetric {
  return <PortfolioAverageMetric>{
    timestamp: timestamp || faker.datatype.number(),
    average: average || faker.datatype.number(),
  };
}
