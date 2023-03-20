import { faker } from '@faker-js/faker';
import { CompanyMetrics } from '../company-metrics.entity';

export function companyMetricsFactory(
  avgEnterpriseToRevenue?: number,
  avgEnterpriseToEbitda?: number,
  avgPeg?: number,
): CompanyMetrics {
  return <CompanyMetrics>{
    avgEnterpriseToRevenue: avgEnterpriseToRevenue ?? faker.datatype.number(),
    avgEnterpriseToEbitda: avgEnterpriseToEbitda ?? faker.datatype.number(),
    avgPeg: avgPeg ?? faker.datatype.number(),
  };
}
