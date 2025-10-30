import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import { PortfolioContribution } from '../entities/portfolio-contribution.entity.js';

@ApiExtraModels(PortfolioContribution)
export class ContributionsPage {
  @ApiProperty()
  uuid: string;
  @ApiProperty()
  count: number;
  @ApiProperty()
  sum: number;
  @ApiProperty()
  offset: number;
  @ApiProperty()
  limit: number;
  @ApiProperty({ isArray: true, type: PortfolioContribution })
  items: PortfolioContribution[];
}
