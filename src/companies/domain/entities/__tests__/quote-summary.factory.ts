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
    price: price || faker.random.numeric(),
    peg: peg || faker.random.numeric(),
  };
}
