import { PortfolioState } from '../entities/portfolio-state.entity';
import { PositionDetailDto } from './position-detail.dto';

export class PortfolioDetailDto {
  id: number;
  name: string;
  created: number;
  cash: string;
  positions: Array<PositionDetailDto>;
  state: PortfolioState;
}
