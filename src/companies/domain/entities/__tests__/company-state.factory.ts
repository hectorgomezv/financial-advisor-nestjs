import { faker } from '@faker-js/faker';
import { CompanyState } from '../company-state.entity';
import Decimal from 'decimal.js';

export function companyStateFactory(
  id?: number,
  timestamp?: Date,
  price?: Decimal,
  forwardPE?: Decimal,
  profitMargins?: Decimal,
  currency?: string,
  companyId?: number,
  enterpriseToRevenue?: Decimal,
  enterpriseToEbitda?: Decimal,
  shortPercentOfFloat?: Decimal,
): CompanyState {
  return <CompanyState>{
    id: id ?? faker.number.int(),
    companyId: companyId ?? faker.number.int(),
    timestamp: timestamp ?? new Date(),
    price: price ?? new Decimal(faker.number.int()),
    currency: currency ?? faker.finance.currencyCode(),
    forwardPE: forwardPE ?? new Decimal(faker.number.int()),
    profitMargins: profitMargins ?? new Decimal(faker.number.int()),
    enterpriseToRevenue: enterpriseToRevenue ?? new Decimal(faker.number.int()),
    enterpriseToEbitda: enterpriseToEbitda ?? new Decimal(faker.number.int()),
    shortPercentOfFloat: shortPercentOfFloat ?? new Decimal(faker.number.int()),
  };
}
