import Decimal from 'decimal.js';
import { Position } from '../position.entity';
import { faker } from '@faker-js/faker';

export function positionFactory(
  id?: number,
  portfolioId?: number,
  targetWeight?: Decimal,
  shares?: Decimal,
  companyId?: number,
  symbol?: string,
  value?: Decimal,
): Position {
  return <Position>{
    id: id ?? faker.number.int(),
    portfolioId: portfolioId ?? faker.number.int(),
    companyId: companyId ?? faker.number.int(),
    targetWeight: targetWeight ?? new Decimal(faker.number.int()),
    shares: shares ?? new Decimal(faker.number.int()),
    symbol: symbol ?? faker.word.sample(),
    value: value ?? new Decimal(faker.number.int()),
  };
}
