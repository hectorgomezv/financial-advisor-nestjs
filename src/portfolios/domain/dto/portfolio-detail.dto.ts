import { PortfolioState } from '../entities/portfolio-state.entity';
import { PositionDetailDto } from './position-detail.dto';

export class PortfolioDetailDto {
  uuid: string;
  name: string;
  created: number;
  cash: number;
  positions: PositionDetailDto[];
  state: PortfolioState;
}
