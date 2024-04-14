import { faker } from '@faker-js/faker';
import { UpsertPositionDto } from '../upsert-position.dto';

export function upsertPositionDtoFactory(
  symbol?: string,
  targetWeight?: number,
  shares?: number,
  blocked?: boolean,
): UpsertPositionDto {
  return <UpsertPositionDto>{
    symbol: symbol ?? faker.word.words(),
    targetWeight: targetWeight ?? faker.number.float({ min: 5, max: 10 }),
    shares: shares ?? faker.number.float({ min: 10, max: 100 }),
    blocked: blocked ?? faker.datatype.boolean(),
  };
}
