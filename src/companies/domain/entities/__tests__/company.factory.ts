import { faker } from '@faker-js/faker';
import { CompanyMetrics } from '../company-metrics.entity.js';
import { Company } from '../company.entity.js';
import { companyMetricsFactory } from './company-metrics.factory.js';

export function companyFactory(
  uuid?: string,
  name?: string,
  symbol?: string,
  metrics?: CompanyMetrics,
): Company {
  return <Company>{
    uuid: uuid ?? faker.string.uuid(),
    name: name ?? faker.word.words(),
    symbol: symbol ?? faker.word.sample(),
    metrics: metrics ?? companyMetricsFactory(),
  };
}
