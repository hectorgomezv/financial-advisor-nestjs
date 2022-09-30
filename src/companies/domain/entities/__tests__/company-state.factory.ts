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
    uuid: uuid || faker.datatype.uuid(),
    timestamp: timestamp || Date.now(),
    price: price || faker.random.numeric(),
    peg: peg || faker.random.numeric(),
    companyUuid: companyUuid || faker.datatype.uuid(),
  };
}
