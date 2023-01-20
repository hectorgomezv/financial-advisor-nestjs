import { CompanyState } from '../company-state.entity';
import { faker } from '@faker-js/faker';

export function companyStateFactory(
  uuid?: string,
  timestamp?: number,
  price?: number,
  peg?: number,
  companyUuid?: string,
): CompanyState {
  return <CompanyState>{
    uuid: uuid ?? faker.datatype.uuid(),
    timestamp: timestamp ?? Date.now(),
    price: price ?? faker.datatype.number(),
    peg: peg ?? faker.datatype.number(),
    companyUuid: companyUuid ?? faker.datatype.uuid(),
  };
}
