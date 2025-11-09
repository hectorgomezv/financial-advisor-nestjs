import { Injectable } from '@nestjs/common';

export interface PgPortfolio {
  id: number;
  cash: string;
  created: Date;
  name: string;
  owner_id: string;
}

export interface PgPortfolioState {
  id: number;
  portfolio_id: number;
  cash: string;
  is_valid: boolean;
  roic_eur: string;
  sum_weights: string;
  timestamp: Date;
  total_value_eur: string;
}

@Injectable()
export class PortfoliosRepository {}
