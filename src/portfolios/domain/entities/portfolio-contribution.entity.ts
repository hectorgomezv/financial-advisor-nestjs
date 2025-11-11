import Decimal from 'decimal.js';

export class PortfolioContribution {
  id: number;
  portfolioId: number;
  timestamp: Date;
  amountEUR: Decimal;
}
