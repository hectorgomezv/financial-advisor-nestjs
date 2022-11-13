import { ApiProperty } from '@nestjs/swagger';
import { UpsertPositionDto as DomainUpsertPositionDto } from '../../domain/dto/upsert-position.dto';

export class UpsertPositionDto implements DomainUpsertPositionDto {
  @ApiProperty()
  symbol: string;
  @ApiProperty()
  targetWeight: number;
  @ApiProperty()
  shares: number;
}
