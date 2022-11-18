import { PortfolioContribution } from '../entities/portfolio-contribution.entity';
import { PortfolioState } from '../entities/portfolio-state.entity';
import { PositionDetailDto } from './position-detail.dto';

export class PortfolioDetailDto {
  uuid: string;
  name: string;
  created: number;
  seed: number;
  cash: number;
  contributions: PortfolioContribution[];
  positions: PositionDetailDto[];
  state: PortfolioState;
}
