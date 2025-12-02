import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import { PortfolioState } from './portfolio-state.entity';
import { PositionWithCompanyState } from './position-with-company-state.entity';

@ApiExtraModels(PositionWithCompanyState, PortfolioState)
export class PortfolioWithPositionsAndState {
  @ApiProperty()
  id: number;
  @ApiProperty()
  cash: string;
  @ApiProperty()
  created: Date;
  @ApiProperty()
  name: string;
  @ApiProperty({ isArray: true, type: PositionWithCompanyState })
  positions: PositionWithCompanyState[];
  @ApiProperty({ type: PortfolioState, nullable: true })
  state: PortfolioState | null;
}
