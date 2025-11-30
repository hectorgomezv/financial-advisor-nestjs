import { faker } from '@faker-js/faker';
import { CompanyMetricsResult } from '../company-metrics-result.entity';

export function companyMetricsResultFactory(
  avgEnterpriseToRevenue?: string,
  avgEnterpriseToEbitda?: string,
  avgForwardPE?: string,
  avgProfitMargins?: string,
): CompanyMetricsResult {
  return <CompanyMetricsResult>{
    avgEnterpriseToRevenue:
      avgEnterpriseToRevenue ?? faker.number.int().toString(),
    avgEnterpriseToEbitda:
      avgEnterpriseToEbitda ?? faker.number.int().toString(),
    avgForwardPE: avgForwardPE ?? faker.number.int().toString(),
    avgProfitMargins: avgProfitMargins ?? faker.number.int().toString(),
  };
}
