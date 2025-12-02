import Decimal from 'decimal.js';
import { PortfolioState } from '../entities/portfolio-state.entity';
import { PositionWithCompanyState } from './position-with-company-state.dto';

export class PortfolioWithPositionsAndState {
  id: number;
  cash: Decimal;
  created: Date;
  name: string;
  positions: Array<PositionWithCompanyState>;
  state: PortfolioState;
}
