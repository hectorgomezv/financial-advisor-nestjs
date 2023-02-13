import { ApiProperty } from '@nestjs/swagger';
import { AddPortfolioContributionDto as DomainAddPortfolioContributionDto } from '../../domain/dto/add-portfolio-contribution.dto';

export class AddPortfolioContributionDto
  implements DomainAddPortfolioContributionDto
{
  @ApiProperty()
  timestamp: number;
  @ApiProperty()
  amountEUR: number;
}
