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
    uuid: uuid ?? faker.datatype.uuid(),
    timestamp: timestamp ?? Date.now(),
    price: price ?? faker.datatype.number(),
    peg: peg ?? faker.datatype.number(),
    enterpriseToRevenue: enterpriseToRevenue ?? faker.datatype.number(),
    enterpriseToEbitda: enterpriseToEbitda ?? faker.datatype.number(),
    shortPercentOfFloat: shortPercentOfFloat ?? faker.datatype.number(),
  };
}
