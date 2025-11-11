import { faker } from '@faker-js/faker';
import { CompanyMetrics } from '../company-metrics.entity';
import { Company } from '../company.entity';
import { companyMetricsFactory } from './company-metrics.factory';

export function companyFactory(
  id?: number,
  name?: string,
  symbol?: string,
  metrics?: CompanyMetrics,
): Company {
  return <Company>{
    id: id ?? faker.number.int(),
    name: name ?? faker.word.words(),
    symbol: symbol ?? faker.word.sample(),
    metrics: metrics ?? companyMetricsFactory(),
  };
}
