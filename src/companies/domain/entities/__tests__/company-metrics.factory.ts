import { faker } from '@faker-js/faker';
import { CompanyMetrics } from '../company-metrics.entity';
import Decimal from 'decimal.js';

export function companyMetricsFactory(
  avgEnterpriseToRevenue?: Decimal,
  avgEnterpriseToEbitda?: Decimal,
  avgForwardPE?: Decimal,
  avgProfitMargins?: Decimal,
): CompanyMetrics {
  return <CompanyMetrics>{
    avgEnterpriseToRevenue:
      avgEnterpriseToRevenue ?? new Decimal(faker.number.int()),
    avgEnterpriseToEbitda:
      avgEnterpriseToEbitda ?? new Decimal(faker.number.int()),
    avgForwardPE: avgForwardPE ?? new Decimal(faker.number.int()),
    avgProfitMargins: avgProfitMargins ?? new Decimal(faker.number.int()),
  };
}
