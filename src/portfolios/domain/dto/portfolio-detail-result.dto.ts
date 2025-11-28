import { PortfolioStateResult } from '../entities/portfolio-state-result.entity';
import { PositionDetailResult } from './position-detail-result';

export class PortfolioDetailResult {
  id: number;
  name: string;
  created: Date;
  cash: string;
  positions: Array<PositionDetailResult>;
  state: PortfolioStateResult;
}
