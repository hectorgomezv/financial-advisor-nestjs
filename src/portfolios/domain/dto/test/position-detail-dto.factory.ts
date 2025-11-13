import { faker } from '@faker-js/faker';
import { PositionDetailDto } from '../position-detail.dto';
import Decimal from 'decimal.js';

export function positionDetailDtoFactory(
  id?: number,
  companyName?: string,
  symbol?: string,
  shares?: Decimal,
  value?: Decimal,
  targetWeight?: Decimal,
  currentWeight?: Decimal,
  deltaWeight?: Decimal,
  deltaShares?: Decimal,
): PositionDetailDto {
  return <PositionDetailDto>{
    id: id ?? faker.number.int(),
    companyName: companyName ?? faker.word.words(),
    symbol: symbol ?? faker.word.sample(),
    shares: shares ?? new Decimal(faker.number.int()),
    value: value ?? new Decimal(faker.number.int()),
    targetWeight: targetWeight ?? new Decimal(faker.number.int()),
    currentWeight: currentWeight ?? new Decimal(faker.number.int()),
    deltaWeight: deltaWeight ?? new Decimal(faker.number.int()),
    deltaShares: deltaShares ?? new Decimal(faker.number.int()),
  };
}
