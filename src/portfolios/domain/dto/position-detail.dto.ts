import Decimal from 'decimal.js';
import { CompanyState } from '../../../companies/domain/entities/company-state.entity';

export class PositionDetailDto {
  id: number;
  companyName: string;
  symbol: string;
  shares: Decimal;
  value: Decimal;
  targetWeight: Decimal;
  currentWeight: Decimal;
  deltaWeight: Decimal;
  deltaShares: Decimal;
  companyState: CompanyState;
  blocked: boolean;
  sharesUpdatedAt: Date | null;
}
