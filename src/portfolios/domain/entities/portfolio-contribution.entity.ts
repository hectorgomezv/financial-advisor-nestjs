import Decimal from 'decimal.js';

export class PortfolioContribution {
  id: number;
  portfolioId: number;
  amountEUR: Decimal;
  timestamp: Date;
}
