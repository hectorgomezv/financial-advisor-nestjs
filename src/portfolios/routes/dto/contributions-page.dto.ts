import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import { PortfolioContribution } from '../entities/portfolio-contribution.entity';

@ApiExtraModels(PortfolioContribution)
export class ContributionsPage {
  @ApiProperty()
  portfolioId: number;
  @ApiProperty()
  count: number;
  @ApiProperty()
  sum: string;
  @ApiProperty()
  offset: number;
  @ApiProperty()
  limit: number;
  @ApiProperty({ isArray: true, type: PortfolioContribution })
  items: PortfolioContribution[];
}
