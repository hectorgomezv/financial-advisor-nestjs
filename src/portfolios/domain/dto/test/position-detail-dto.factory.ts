import { faker } from '@faker-js/faker';
import { PositionDetailDto } from '../position-detail.dto.js';

export function positionDetailDtoFactory(
  uuid?: string,
  companyName?: string,
  symbol?: string,
  shares?: number,
  value?: number,
  targetWeight?: number,
  currentWeight?: number,
  deltaWeight?: number,
  deltaShares?: number,
): PositionDetailDto {
  return <PositionDetailDto>{
    uuid: uuid ?? faker.string.uuid(),
    companyName: companyName ?? faker.string.uuid(),
    symbol: symbol ?? faker.word.sample(),
    shares: shares ?? faker.number.int(),
    value: value ?? faker.number.int(),
    targetWeight: targetWeight ?? faker.number.int(),
    currentWeight: currentWeight ?? faker.number.int(),
    deltaWeight: deltaWeight ?? faker.number.int(),
    deltaShares: deltaShares ?? faker.number.int(),
  };
}
