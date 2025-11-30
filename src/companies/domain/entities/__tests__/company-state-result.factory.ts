import { faker } from '@faker-js/faker';
import Decimal from 'decimal.js';
import { CompanyStateResult } from '../../company-states.service';

export function companyStateResultFactory(
  id?: number,
  timestamp?: number,
  price?: number,
  forwardPE?: number,
  profitMargins?: number,
  currency?: string,
  companyId?: number,
  enterpriseToRevenue?: number,
  enterpriseToEbitda?: number,
  shortPercentOfFloat?: number,
): CompanyStateResult {
  return <CompanyStateResult>{
    id: id ?? faker.number.int(),
    companyId: companyId ?? faker.number.int(),
    timestamp: timestamp ?? new Date(),
    price: price ?? new Decimal(faker.number.int()).toFixed(2),
    currency: currency ?? faker.finance.currencyCode(),
    forwardPE: forwardPE ?? new Decimal(faker.number.int()).toFixed(2),
    profitMargins: profitMargins ?? new Decimal(faker.number.int()).toFixed(2),
    enterpriseToRevenue:
      enterpriseToRevenue ?? new Decimal(faker.number.int()).toFixed(2),
    enterpriseToEbitda:
      enterpriseToEbitda ?? new Decimal(faker.number.int()).toFixed(2),
    shortPercentOfFloat:
      shortPercentOfFloat ?? new Decimal(faker.number.int()).toFixed(2),
  };
}
