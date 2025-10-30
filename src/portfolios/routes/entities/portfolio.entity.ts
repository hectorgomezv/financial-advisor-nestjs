import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import { Portfolio as DomainPortfolio } from '../../domain/entities/portfolio.entity.js';
import { PortfolioContribution } from './portfolio-contribution.entity.js';
import { PortfolioState } from './portfolio-state.entity.js';
import { Position } from './position.entity.js';

@ApiExtraModels(Position, PortfolioContribution)
export class Portfolio implements DomainPortfolio {
  @ApiProperty()
  uuid: string;
  @ApiProperty()
  name: string;
  @ApiProperty()
  ownerId: string;
  @ApiProperty()
  created: number;
  @ApiProperty({ isArray: true, type: Position })
  positions: Position[];
  @ApiProperty()
  cash: number;
  @ApiProperty({ isArray: true, type: PortfolioContribution })
  contributions: PortfolioContribution[];
  @ApiProperty()
  state: PortfolioState;
}
