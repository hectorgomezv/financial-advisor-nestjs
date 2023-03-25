import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsPositive } from 'class-validator';
import { AddPortfolioContributionDto as DomainAddPortfolioContributionDto } from '../../domain/dto/add-portfolio-contribution.dto';

export class AddPortfolioContributionDto
  implements DomainAddPortfolioContributionDto
{
  @ApiProperty()
  timestamp: Date;
  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  amountEUR: number;
}
