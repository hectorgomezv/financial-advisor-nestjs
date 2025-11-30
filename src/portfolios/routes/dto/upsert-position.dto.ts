import { ApiProperty } from '@nestjs/swagger';

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
