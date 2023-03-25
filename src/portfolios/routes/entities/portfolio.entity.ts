import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import { Portfolio as DomainPortfolio } from '../../domain/entities/portfolio.entity';
import { PortfolioContribution } from './portfolio-contribution.entity';
import { PortfolioState } from './portfolio-state.entity';
import { Position } from './position.entity';

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
