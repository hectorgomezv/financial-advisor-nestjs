export interface PortfolioStateResult {
  id: number;
  portfolioId: number;
  cash: string;
  isValid: boolean;
  roicEUR: string;
  sumWeights: string;
  timestamp: Date;
  totalValueEUR: string;
}
