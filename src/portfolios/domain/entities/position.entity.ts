export class Position {
  uuid: string;
  portfolioUuid: string;
  targetWeight: number;
  shares: number;
  companyUuid: string;
  symbol: string;
  value: number;
  blocked: boolean;
  sharesUpdatedAt: Date;
}
