import Decimal from 'decimal.js';
import { CompanyState } from '../../../companies/domain/entities/company-state.entity';

export class PositionWithCompanyState {
  id: number;
  blocked: boolean;
  companyName: string;
  companyState: CompanyState;
  currentWeight: Decimal;
  deltaShares: Decimal;
  deltaWeight: Decimal;
  shares: Decimal;
  sharesUpdatedAt: Date | null;
  symbol: string;
  targetWeight: Decimal;
  value: Decimal;
}
