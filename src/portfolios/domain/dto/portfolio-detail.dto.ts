import Decimal from 'decimal.js';
import { PortfolioStateResult } from '../entities/portfolio-state-result.entity';
import { PositionDetailDto } from './position-detail.dto';

export class PortfolioDetailDto {
  id: number;
  name: string;
  created: Date;
  cash: Decimal;
  positions: Array<PositionDetailDto>;
  state: PortfolioStateResult;
}
