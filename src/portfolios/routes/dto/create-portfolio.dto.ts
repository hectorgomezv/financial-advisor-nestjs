import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsPositive, IsString } from 'class-validator';
import { CreatePortfolioDto as DomainCreatePortfolioDto } from '../../domain/dto/create-portfolio.dto';

export class CreatePortfolioDto implements DomainCreatePortfolioDto {
  @ApiProperty()
  @IsString()
  name: string;
  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  seed: number;
}
