import { ApiProperty } from '@nestjs/swagger';
import { DataPoint as DomainDataPoint } from '../../../common/domain/entities/data-point.entity';

export class DataPoint implements DomainDataPoint {
  @ApiProperty()
  timestamp: number;
  @ApiProperty()
  value: number;
}
