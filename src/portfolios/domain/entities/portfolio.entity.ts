import Decimal from 'decimal.js';
import { PortfolioContribution } from './portfolio-contribution.entity';
import { PortfolioState } from './portfolio-state.entity';
import { Position } from './position.entity';

export class Portfolio {
  id: number;
  cash: Decimal;
  contributions: Array<PortfolioContribution>;
  created: Date;
  name: string;
  ownerId: string;
  positions: Array<Position>;
  state: PortfolioState | null;
}
