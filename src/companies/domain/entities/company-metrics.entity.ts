import Decimal from 'decimal.js';

export class CompanyMetrics {
  avgEnterpriseToRevenue: Decimal;
  avgEnterpriseToEbitda: Decimal;
  avgForwardPE: Decimal;
  avgProfitMargins: Decimal;

  constructor(
    avgEnterpriseToRevenue: Decimal,
    avgEnterpriseToEbitda: Decimal,
    avgForwardPE: Decimal,
    avgProfitMargins: Decimal,
  ) {
    this.avgEnterpriseToRevenue = avgEnterpriseToRevenue;
    this.avgEnterpriseToEbitda = avgEnterpriseToEbitda;
    this.avgForwardPE = avgForwardPE;
    this.avgProfitMargins = avgProfitMargins;
  }
}
