import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';
import { AddPortfolioContributionDto as DomainAddPortfolioContributionDto } from '../../domain/dto/add-portfolio-contribution.dto.js';

export class AddPortfolioContributionDto
  implements DomainAddPortfolioContributionDto
{
  @ApiProperty()
  timestamp: Date;
  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  amountEUR: number;
}
