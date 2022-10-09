import { faker } from '@faker-js/faker';
import { UpsertPositionDto } from '../upsert-position.dto';

export function upsertPositionDtoFactory(
  symbol?: string,
  targetWeight?: number,
  shares?: number,
): UpsertPositionDto {
  return <UpsertPositionDto>{
    symbol: symbol ?? faker.random.words(),
    targetWeight: targetWeight ?? faker.datatype.number(),
    shares: shares ?? faker.datatype.number(),
  };
}
