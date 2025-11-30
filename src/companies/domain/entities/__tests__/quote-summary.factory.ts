import { faker } from '@faker-js/faker';
import { QuoteSummary } from '../quote-summary.entity';

export function quoteSummaryFactory(
  timestamp?: number,
  price?: number,
  forwardPE?: number,
  profitMargins?: number,
  enterpriseToRevenue?: number,
  enterpriseToEbitda?: number,
  shortPercentOfFloat?: number,
): QuoteSummary {
  return <QuoteSummary>{
    timestamp: timestamp ?? Date.now(),
    price: price ?? faker.number.int(),
    forwardPE: forwardPE ?? faker.number.int(),
    profitMargins: profitMargins ?? faker.number.int(),
    enterpriseToRevenue: enterpriseToRevenue ?? faker.number.int(),
    enterpriseToEbitda: enterpriseToEbitda ?? faker.number.int(),
    shortPercentOfFloat: shortPercentOfFloat ?? faker.number.int(),
  };
}
