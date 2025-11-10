import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import { Index as DomainIndex } from '../../domain/entities/index.entity';
import { DataPoint } from '../../../common/routes/entities/data-point.entity';

@ApiExtraModels(DataPoint)
export class Index implements DomainIndex {
  @ApiProperty()
  id: number;
  @ApiProperty()
  name: string;
  @ApiProperty()
  symbol: string;
  @ApiProperty({ isArray: true, type: DataPoint })
  values: DataPoint[];
}
