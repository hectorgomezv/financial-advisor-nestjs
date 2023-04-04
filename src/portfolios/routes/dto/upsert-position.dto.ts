import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsPositive, IsString } from 'class-validator';
import { UpsertPositionDto as DomainUpsertPositionDto } from '../../domain/dto/upsert-position.dto';

export class UpsertPositionDto implements DomainUpsertPositionDto {
  @ApiProperty()
  @IsString()
  symbol: string;
  @ApiProperty()
  @IsPositive()
  targetWeight: number;
  @ApiProperty()
  @IsInt()
  shares: number;
  @ApiProperty()
  @IsBoolean()
  blocked: false;
}
