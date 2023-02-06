import { ApiProperty } from '@nestjs/swagger';
import { DataPoint as DomainDataPoint } from '../../../common/domain/entities/data-point.entity';

// TODO: move to common
export class DataPoint implements DomainDataPoint {
  @ApiProperty()
  timestamp: number;
  @ApiProperty()
  value: number;
}
