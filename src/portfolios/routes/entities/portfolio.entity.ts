import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import { PortfolioContribution } from './portfolio-contribution.entity';
import { PortfolioState } from './portfolio-state.entity';
import { Position } from './position.entity';

@ApiExtraModels(Position, PortfolioContribution)
export class Portfolio {
  @ApiProperty()
  id: number;
  @ApiProperty()
  name: string;
  @ApiProperty()
  ownerId: string;
  @ApiProperty()
  created: Date;
  @ApiProperty({ isArray: true, type: Position })
  positions: Position[];
  @ApiProperty()
  cash: string;
  @ApiProperty({ isArray: true, type: PortfolioContribution })
  contributions: PortfolioContribution[];
  @ApiProperty()
  state: PortfolioState;
}
