import { faker } from '@faker-js/faker';
import { CompanyState } from '../company-state.entity';

export function companyStateFactory(
  uuid?: string,
  timestamp?: number,
  price?: number,
  forwardPE?: number,
  profitMargins?: number,
  currency?: string,
  companyUuid?: string,
  enterpriseToRevenue?: number,
  enterpriseToEbitda?: number,
  shortPercentOfFloat?: number,
): CompanyState {
  return <CompanyState>{
    uuid: uuid ?? faker.string.uuid(),
    timestamp: timestamp ?? Date.now(),
    price: price ?? faker.number.int(),
    currency: currency ?? faker.finance.currencyCode(),
    forwardPE: forwardPE ?? faker.number.int(),
    profitMargins: profitMargins ?? faker.number.int(),
    companyUuid: companyUuid ?? faker.string.uuid(),
    enterpriseToRevenue: enterpriseToRevenue ?? faker.number.int(),
    enterpriseToEbitda: enterpriseToEbitda ?? faker.number.int(),
    shortPercentOfFloat: shortPercentOfFloat ?? faker.number.int(),
  };
}
