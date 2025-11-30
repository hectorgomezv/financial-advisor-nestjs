import Decimal from 'decimal.js';
import { PortfolioContribution } from './portfolio-contribution.entity';
import { PortfolioState } from './portfolio-state.entity';
import { Position } from './position.entity';

export class Portfolio {
  id: number;
  name: string;
  ownerId: string;
  created: Date;
  positions: Array<Position>;
  cash: Decimal;
  contributions: Array<PortfolioContribution>;
  state: PortfolioState | null;
}
