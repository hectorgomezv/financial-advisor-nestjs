import Decimal from 'decimal.js';

export class Position {
  id: number;
  portfolioId: number;
  targetWeight: Decimal;
  shares: Decimal;
  companyId: number;
  symbol: string;
  value: Decimal;
  blocked: boolean;
  sharesUpdatedAt: Date;
}
