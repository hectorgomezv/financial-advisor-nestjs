import { PortfolioStateDetailDto } from './portfolio-state-detail.dto';
import { PositionDetailDto } from './position-detail.dto';

export class PortfolioDetailDto {
  uuid: string;
  name: string;
  created: number;
  positions: PositionDetailDto[];
  state: PortfolioStateDetailDto[];
}
