import Decimal from 'decimal.js';

export interface CreatePositionDto {
  portfolioId: number;
  companyId: number;
  targetWeight: Decimal;
  shares: Decimal;
  blocked: boolean;
  sharesUpdatedAt: Date;
}
