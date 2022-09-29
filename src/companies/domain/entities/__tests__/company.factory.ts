import { Company } from '../company.entity';
import { faker } from '@faker-js/faker';

export function companyFactory(
  uuid?: string,
  name?: string,
  symbol?: string,
): Company {
  return <Company>{
    uuid: uuid || faker.datatype.uuid(),
    name: name || faker.random.words(),
    symbol: symbol || faker.finance.currencyCode(),
  };
}
