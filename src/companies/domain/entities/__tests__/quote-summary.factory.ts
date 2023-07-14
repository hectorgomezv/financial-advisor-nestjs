import { faker } from '@faker-js/faker';
import { QuoteSummary } from '../quote-summary.entity';

export function quoteSummaryFactory(
  uuid?: string,
  timestamp?: number,
  price?: number,
  peg?: number,
  enterpriseToRevenue?: number,
  enterpriseToEbitda?: number,
  shortPercentOfFloat?: number,
): QuoteSummary {
  return <QuoteSummary>{
    uuid: uuid ?? faker.string.uuid(),
    timestamp: timestamp ?? Date.now(),
    price: price ?? faker.number.int(),
    peg: peg ?? faker.number.int(),
    enterpriseToRevenue: enterpriseToRevenue ?? faker.number.int(),
    enterpriseToEbitda: enterpriseToEbitda ?? faker.number.int(),
    shortPercentOfFloat: shortPercentOfFloat ?? faker.number.int(),
  };
}
