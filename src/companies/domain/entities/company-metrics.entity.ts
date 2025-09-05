export class CompanyMetrics {
  avgEnterpriseToRevenue: number;
  avgEnterpriseToEbitda: number;
  avgForwardPE: number;
  avgProfitMargins: number;

  constructor(
    avgEnterpriseToRevenue: number,
    avgEnterpriseToEbitda: number,
    avgForwardPE: number,
    avgProfitMargins: number,
  ) {
    this.avgEnterpriseToRevenue = avgEnterpriseToRevenue;
    this.avgEnterpriseToEbitda = avgEnterpriseToEbitda;
    this.avgForwardPE = avgForwardPE;
    this.avgProfitMargins = avgProfitMargins;
  }
}
