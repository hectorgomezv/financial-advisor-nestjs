import { ApiProperty } from '@nestjs/swagger';
import { PortfolioContribution } from '../entities/portfolio-contribution.entity';

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
  @ApiProperty()
  items: PortfolioContribution[];
}
