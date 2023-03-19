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
    uuid: uuid ?? faker.datatype.uuid(),
    timestamp: timestamp ?? Date.now(),
    price: price ?? faker.datatype.number(),
    currency: currency ?? faker.finance.currencyCode(),
    peg: peg ?? faker.datatype.number(),
    companyUuid: companyUuid ?? faker.datatype.uuid(),
    enterpriseToRevenue: enterpriseToRevenue ?? faker.datatype.number(),
    enterpriseToEbitda: enterpriseToEbitda ?? faker.datatype.number(),
    shortPercentOfFloat: shortPercentOfFloat ?? faker.datatype.number(),
  };
}
