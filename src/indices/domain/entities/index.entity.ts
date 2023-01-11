import { DataPoint } from '../../../common/domain/entities/data-point.entity';

export class Index {
  uuid: string;
  name: string;
  symbol: string;
  values: DataPoint[];
}
