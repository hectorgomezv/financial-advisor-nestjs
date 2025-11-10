import { DataPoint } from '../../../common/domain/entities/data-point.entity';

export class Index {
  id: number;
  name: string;
  symbol: string;
  values: DataPoint[];
}
