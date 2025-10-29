import { CompanyState } from '../../../companies/domain/entities/company-state.entity.js';

export class PositionDetailDto {
  uuid: string;
  companyName: string;
  symbol: string;
  shares: number;
  value: number;
  targetWeight: number;
  currentWeight: number;
  deltaWeight: number;
  deltaShares: number;
  companyState: CompanyState;
  blocked: boolean;
  sharesUpdatedAt: Date | null;
}
