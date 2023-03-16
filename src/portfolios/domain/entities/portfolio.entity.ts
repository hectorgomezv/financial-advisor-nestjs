import { PortfolioContribution } from './portfolio-contribution.entity';
import { PortfolioState } from './portfolio-state.entity';
import { Position } from './position.entity';

export class Portfolio {
  uuid: string;
  name: string;
  ownerId: string;
  created: number;
  positions: Position[];
  cash: number;
  contributions: PortfolioContribution[];
  state: PortfolioState;
}
