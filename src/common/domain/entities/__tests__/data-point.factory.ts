import { faker } from '@faker-js/faker';
import { DataPoint } from '../data-point.entity';

export function dataPointFactory(timestamp?: Date, value?: number) {
  return <DataPoint>{
    timestamp: timestamp ?? faker.date.recent(),
    value: value ?? faker.datatype.number(),
  };
}
