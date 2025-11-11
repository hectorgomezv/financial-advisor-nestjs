import { faker } from '@faker-js/faker';
import { CompanyState } from '../company-state.entity';
import Decimal from 'decimal.js';

export function companyStateFactory(
  id?: string,
  timestamp?: number,
  price?: number,
  forwardPE?: number,
  profitMargins?: number,
  currency?: string,
  companyId?: number,
  enterpriseToRevenue?: number,
  enterpriseToEbitda?: number,
  shortPercentOfFloat?: number,
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
