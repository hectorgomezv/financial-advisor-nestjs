import Decimal from 'decimal.js';
import { PortfolioContribution } from './portfolio-contribution.entity';
import { PortfolioState } from './portfolio-state.entity';
import { Position } from './position.entity';

export class Portfolio {
  id: number;
  name: string;
  ownerId: string;
  created: Date;
  positions: Position[];
  cash: Decimal;
  contributions: PortfolioContribution[];
  state: PortfolioState | null;
}
