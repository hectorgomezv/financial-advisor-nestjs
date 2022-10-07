import { ApiProperty } from '@nestjs/swagger';
import { Position as DomainPosition } from '../../domain/entities/position.entity';

export class Position implements DomainPosition {
  @ApiProperty()
  uuid: string;
  @ApiProperty()
  portfolioUuid: string;
  @ApiProperty()
  targetWeight: number;
  @ApiProperty()
  shares: number;
  @ApiProperty()
  companyUuid: string;
  @ApiProperty()
  symbol: string;
  @ApiProperty()
  value: number;
}
