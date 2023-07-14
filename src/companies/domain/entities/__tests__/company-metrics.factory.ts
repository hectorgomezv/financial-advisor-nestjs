import { faker } from '@faker-js/faker';
import { CompanyMetrics } from '../company-metrics.entity';

export function companyMetricsFactory(
  avgEnterpriseToRevenue?: number,
  avgEnterpriseToEbitda?: number,
  avgPeg?: number,
): CompanyMetrics {
  return <CompanyMetrics>{
    avgEnterpriseToRevenue: avgEnterpriseToRevenue ?? faker.number.int(),
    avgEnterpriseToEbitda: avgEnterpriseToEbitda ?? faker.number.int(),
    avgPeg: avgPeg ?? faker.number.int(),
  };
}
