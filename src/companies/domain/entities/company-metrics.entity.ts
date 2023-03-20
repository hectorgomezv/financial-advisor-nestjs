export class CompanyMetrics {
  avgEnterpriseToRevenue: number;
  avgEnterpriseToEbitda: number;
  avgPeg: number;

  constructor(
    avgEnterpriseToRevenue: number,
    avgEnterpriseToEbitda: number,
    avgPeg: number,
  ) {
    this.avgEnterpriseToRevenue = avgEnterpriseToRevenue;
    this.avgEnterpriseToEbitda = avgEnterpriseToEbitda;
    this.avgPeg = avgPeg;
  }
}
