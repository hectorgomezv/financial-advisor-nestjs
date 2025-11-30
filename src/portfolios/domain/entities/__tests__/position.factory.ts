import Decimal from 'decimal.js';
import { Position } from '../position.entity';
import { faker } from '@faker-js/faker';

export function positionFactory(
  id?: number,
  portfolioId?: number,
  companyId?: number,
  blocked?: boolean,
  shares?: Decimal,
  sharesUpdatedAt?: Date,
  targetWeight?: Decimal,
  value?: Decimal,
): Position {
  return <Position>{
    id: id ?? faker.number.int(),
    portfolioId: portfolioId ?? faker.number.int(),
    companyId: companyId ?? faker.number.int(),
    blocked: blocked ?? faker.datatype.boolean(),
    shares: shares ?? new Decimal(faker.number.int()),
    sharesUpdatedAt: sharesUpdatedAt ?? faker.date.recent(),
    targetWeight: targetWeight ?? new Decimal(faker.number.int()),
    value: value ?? new Decimal(faker.number.int()),
  };
}
