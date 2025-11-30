import { CompanyStateResult } from '../../../companies/domain/company-states.service';

export class PositionDetailResult {
  id: number;
  companyName: string;
  symbol: string;
  shares: string;
  value: string;
  targetWeight: string;
  currentWeight: string;
  deltaWeight: string;
  deltaShares: string;
  companyState: CompanyStateResult;
  blocked: boolean;
  sharesUpdatedAt: Date | null;
}
