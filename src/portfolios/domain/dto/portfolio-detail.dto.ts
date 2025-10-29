import { PortfolioState } from '../entities/portfolio-state.entity.js';
import { PositionDetailDto } from './position-detail.dto.js';

export class PortfolioDetailDto {
  uuid: string;
  name: string;
  created: number;
  cash: number;
  positions: PositionDetailDto[];
  state: PortfolioState;
}
