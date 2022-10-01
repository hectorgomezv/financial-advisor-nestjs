import { QuoteSummary } from '../quote-summary.entity';
import { faker } from '@faker-js/faker';

export function quoteSummaryFactory(
  uuid?: string,
  timestamp?: number,
  price?: number,
  peg?: number,
): QuoteSummary {
  return <QuoteSummary>{
    uuid: uuid || faker.datatype.uuid(),
    timestamp: timestamp || Date.now(),
    price: price || faker.datatype.number(),
    peg: peg || faker.datatype.number(),
  };
}
