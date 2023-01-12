import { ApiProperty } from '@nestjs/swagger';
import { DataPoint } from '../../common/domain/entities/data-point.entity';
import { Index as DomainIndex } from '../domain/entities/index.entity';

export class Index implements DomainIndex {
  @ApiProperty()
  uuid: string;
  @ApiProperty()
  name: string;
  @ApiProperty()
  symbol: string;
  @ApiProperty()
  values: DataPoint[]; // TODO: DataPoint route entity
}
