import { faker } from '@faker-js/faker';
import { CreateCompanyDto } from '../create-company.dto';

export function createCompanyDtoFactory(
  name?: string,
  symbol?: string,
): CreateCompanyDto {
  return <CreateCompanyDto>{
    name: name ?? faker.word.words(),
    symbol: symbol ?? 'CRM',
  };
}
