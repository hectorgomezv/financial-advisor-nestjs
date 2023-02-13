import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';
import { UpsertPositionDto as DomainUpsertPositionDto } from '../../domain/dto/upsert-position.dto';

export class UpsertPositionDto implements DomainUpsertPositionDto {
  @ApiProperty()
  @IsString()
  symbol: string;
  @ApiProperty()
  @IsInt()
  targetWeight: number;
  @ApiProperty()
  @IsInt()
  shares: number;
}
