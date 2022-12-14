import { ApiProperty } from '@nestjs/swagger';
import { PortfolioState } from '../../domain/entities/portfolio-state.entity';
import { Portfolio as DomainPortfolio } from '../../domain/entities/portfolio.entity';
import { Position } from '../../domain/entities/position.entity';
import { PortfolioContribution } from './portfolio-contribution.entity';

export class Portfolio implements DomainPortfolio {
  @ApiProperty()
  uuid: string;
  @ApiProperty()
  name: string;
  @ApiProperty()
  ownerId: string;
  @ApiProperty()
  created: number;
  @ApiProperty()
  positions: Position[];
  @ApiProperty()
  seed: number;
  @ApiProperty()
  cash: number;
  @ApiProperty()
  contributions: PortfolioContribution[];
  @ApiProperty()
  state: PortfolioState;
}
