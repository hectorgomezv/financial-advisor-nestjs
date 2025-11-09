import { Injectable } from '@nestjs/common';

export interface PgPosition {
  id: number;
  portfolio_id: number;
  company_id: number;
  target_weight: string;
  shares: string;
  blocked: boolean;
  shares_updated_at: Date;
}

@Injectable()
export class PositionsRepository {}
