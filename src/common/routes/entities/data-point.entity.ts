import { ApiProperty } from '@nestjs/swagger';
import { DataPoint as DomainDataPoint } from '../../domain/entities/data-point.entity';

export class DataPoint implements DomainDataPoint {
  @ApiProperty()
  timestamp: Date;
  @ApiProperty()
  value: number;
}
