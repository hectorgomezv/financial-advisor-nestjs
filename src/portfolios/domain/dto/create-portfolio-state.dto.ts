import Decimal from 'decimal.js';

export interface CreatePortfolioStateDto {
  portfolioId: number;
  cash: Decimal;
  isValid: boolean;
  roicEUR: Decimal;
  sumWeights: Decimal;
  timestamp: Date;
  totalValueEUR: Decimal;
}
