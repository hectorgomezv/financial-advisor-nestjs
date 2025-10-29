import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsPositive, IsString } from 'class-validator';
import { UpsertPositionDto as DomainUpsertPositionDto } from '../../domain/dto/upsert-position.dto.js';

export class UpsertPositionDto implements DomainUpsertPositionDto {
  @ApiProperty()
  @IsString()
  symbol: string;
  @ApiProperty()
  @IsPositive()
  targetWeight: number;
  @ApiProperty()
  @IsPositive()
  shares: number;
  @ApiProperty()
  @IsBoolean()
  blocked: false;
}
