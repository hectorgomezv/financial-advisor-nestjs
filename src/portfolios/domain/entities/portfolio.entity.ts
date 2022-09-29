import { PortfolioState } from './portfolio-state.entity';
import { Position } from './position.entity';

export class Portfolio {
  uuid: string;
  name: string;
  created: number;
  positions: Position[];
  state: PortfolioState;
}
