import { faker } from '@faker-js/faker';
import { CompanyMetrics } from '../company-metrics.entity';
import { Company } from '../company.entity';
import { companyMetricsFactory } from './company-metrics.factory';

export function companyFactory(
  uuid?: string,
  name?: string,
  symbol?: string,
  metrics?: CompanyMetrics,
): Company {
  return <Company>{
    uuid: uuid ?? faker.datatype.uuid(),
    name: name ?? faker.random.words(),
    symbol: symbol ?? faker.random.word(),
    metrics: metrics ?? companyMetricsFactory(),
  };
}
