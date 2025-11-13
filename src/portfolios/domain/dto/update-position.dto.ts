import Decimal from 'decimal.js';

export interface UpdatePositionDto {
  targetWeight: Decimal;
  shares: Decimal;
  blocked: boolean;
  sharesUpdatedAt: Date;
  value: Decimal;
}
