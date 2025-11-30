import { faker } from '@faker-js/faker';
import { UpsertPositionDto } from '../upsert-position.dto';
import Decimal from 'decimal.js';

export function upsertPositionDtoFactory(
  symbol?: string,
  targetWeight?: Decimal,
  shares?: Decimal,
  blocked?: boolean,
): UpsertPositionDto {
  return <UpsertPositionDto>{
    symbol: symbol ?? faker.word.words(),
    targetWeight:
      targetWeight ?? new Decimal(faker.number.float({ min: 5, max: 10 })),
    shares: shares ?? new Decimal(faker.number.float({ min: 10, max: 100 })),
    blocked: blocked ?? faker.datatype.boolean(),
  };
}
