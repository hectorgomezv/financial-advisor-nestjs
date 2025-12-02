import { faker } from '@faker-js/faker';
import { PositionWithCompanyState } from '../position-with-company-state.dto';
import Decimal from 'decimal.js';

export function positionWithCompanyStateFactory(
  id?: number,
  companyName?: string,
  symbol?: string,
  shares?: Decimal,
  value?: Decimal,
  targetWeight?: Decimal,
  currentWeight?: Decimal,
  deltaWeight?: Decimal,
  deltaShares?: Decimal,
): PositionWithCompanyState {
  return <PositionWithCompanyState>{
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
