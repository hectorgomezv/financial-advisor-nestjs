import { ApiProperty } from '@nestjs/swagger';
import { UpsertPositionDto as DomainUpsertPositionDto } from '../../domain/dto/upsert-position.dto';

export class UpsertPositionDto {
  @ApiProperty()
  symbol: string;
  @ApiProperty()
  targetWeight: string;
  @ApiProperty()
  shares: string;
  @ApiProperty()
  blocked: false;
}
