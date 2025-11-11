import Decimal from 'decimal.js';

export interface PortfolioAverageBalance {
  timestamp: Date;
  average: Decimal;
  contributions: number;
}
