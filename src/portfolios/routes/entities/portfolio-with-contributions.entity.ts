import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import { PortfolioContribution } from './portfolio-contribution.entity';

@ApiExtraModels(PortfolioContribution)
export class PortfolioWithContributions {
  @ApiProperty()
  id: number;
  @ApiProperty()
  cash: string;
  @ApiProperty({ isArray: true, type: PortfolioContribution })
  contributions: PortfolioContribution[];
  @ApiProperty()
  created: Date;
  @ApiProperty()
  name: string;
  @ApiProperty()
  ownerId: string;
}
