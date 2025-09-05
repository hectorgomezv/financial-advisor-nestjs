import { faker } from '@faker-js/faker';
import { CompanyMetrics } from '../company-metrics.entity';

export function companyMetricsFactory(
  avgEnterpriseToRevenue?: number,
  avgEnterpriseToEbitda?: number,
  avgForwardPE?: number,
  avgProfitMargins?: number,
): CompanyMetrics {
  return <CompanyMetrics>{
    avgEnterpriseToRevenue: avgEnterpriseToRevenue ?? faker.number.int(),
    avgEnterpriseToEbitda: avgEnterpriseToEbitda ?? faker.number.int(),
    avgForwardPE: avgForwardPE ?? faker.number.int(),
    avgProfitMargins: avgProfitMargins ?? faker.number.int(),
  };
}
