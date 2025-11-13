import Decimal from 'decimal.js';
import { PortfolioState } from '../entities/portfolio-state.entity';
import { PositionDetailDto } from './position-detail.dto';

export class PortfolioDetailDto {
  id: number;
  name: string;
  created: Date;
  cash: Decimal;
  positions: Array<PositionDetailDto>;
  state: PortfolioState;
}
