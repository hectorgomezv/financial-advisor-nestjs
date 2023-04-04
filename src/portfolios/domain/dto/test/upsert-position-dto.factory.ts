import { faker } from '@faker-js/faker';
import { UpsertPositionDto } from '../upsert-position.dto';

export function upsertPositionDtoFactory(
  symbol?: string,
  targetWeight?: number,
  shares?: number,
  blocked?: boolean,
): UpsertPositionDto {
  return <UpsertPositionDto>{
    symbol: symbol ?? faker.random.words(),
    targetWeight: targetWeight ?? faker.datatype.number({ min: 5, max: 10 }),
    shares: shares ?? faker.datatype.number({ min: 10, max: 100 }),
    blocked: blocked ?? faker.datatype.boolean(),
  };
}
