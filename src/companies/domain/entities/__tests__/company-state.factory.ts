import { faker } from '@faker-js/faker';
import { CompanyState } from '../company-state.entity';

export function companyStateFactory(
  uuid?: string,
  timestamp?: number,
  price?: number,
  peg?: number,
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
    peg: peg ?? faker.number.int(),
    companyUuid: companyUuid ?? faker.string.uuid(),
    enterpriseToRevenue: enterpriseToRevenue ?? faker.number.int(),
    enterpriseToEbitda: enterpriseToEbitda ?? faker.number.int(),
    shortPercentOfFloat: shortPercentOfFloat ?? faker.number.int(),
  };
}
