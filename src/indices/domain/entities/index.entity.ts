import { DataPoint } from '../../../common/domain/entities/data-point.entity.js';

export class Index {
  uuid: string;
  name: string;
  symbol: string;
  values: DataPoint[];
}
