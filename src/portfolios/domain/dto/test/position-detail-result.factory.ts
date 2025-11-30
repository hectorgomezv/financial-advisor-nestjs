import { faker } from '@faker-js/faker';
import { PositionDetailResult } from '../position-detail-result';

export function positionDetailResultFactory(
  id?: number,
  companyName?: string,
  symbol?: string,
  shares?: string,
  value?: string,
  targetWeight?: string,
  currentWeight?: string,
  deltaWeight?: string,
  deltaShares?: string,
): PositionDetailResult {
  return <PositionDetailResult>{
    id: id ?? faker.number.int(),
    companyName: companyName ?? faker.word.words(),
    symbol: symbol ?? faker.word.sample(),
    shares: shares ?? faker.number.int().toString(),
    value: value ?? faker.number.int().toString(),
    targetWeight: targetWeight ?? faker.number.int().toString(),
    currentWeight: currentWeight ?? faker.number.int().toString(),
    deltaWeight: deltaWeight ?? faker.number.int().toString(),
    deltaShares: deltaShares ?? faker.number.int().toString(),
  };
}
