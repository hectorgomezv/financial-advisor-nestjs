import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { CreatePortfolioDto as DomainCreatePortfolioDto } from '../../domain/dto/create-portfolio.dto.js';

export class CreatePortfolioDto implements DomainCreatePortfolioDto {
  @ApiProperty()
  @IsString()
  name: string;
}
