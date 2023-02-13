import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsPositive } from 'class-validator';
import { UpdatePortfolioCashDto as DomainUpdatePortfolioCashDto } from '../../domain/dto/update-portfolio-cash.dto';

export class UpdatePortfolioCashDto implements DomainUpdatePortfolioCashDto {
  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  cash: number;
}
