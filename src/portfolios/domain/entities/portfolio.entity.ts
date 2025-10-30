import { PortfolioContribution } from './portfolio-contribution.entity.js';
import { PortfolioState } from './portfolio-state.entity.js';
import { Position } from './position.entity.js';

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
