import { faker } from '@faker-js/faker';
import { DataPoint } from '../data-point.entity.js';

export function dataPointFactory(timestamp?: Date, value?: number) {
  return <DataPoint>{
    timestamp: timestamp ?? faker.date.recent(),
    value: value ?? faker.number.int(),
  };
}
