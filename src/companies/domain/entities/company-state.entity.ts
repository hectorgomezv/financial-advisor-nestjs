import Decimal from 'decimal.js';

export class CompanyState {
  id: number;
  companyId: number;
  currency: string;
  enterpriseToEbitda: Decimal;
  enterpriseToRevenue: Decimal;
  forwardPE: Decimal;
  price: Decimal;
  profitMargins: Decimal;
  shortPercentOfFloat: Decimal;
  timestamp: Date;
}
