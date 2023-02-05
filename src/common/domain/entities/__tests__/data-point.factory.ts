import { faker } from '@faker-js/faker';
import { DataPoint } from '../../../../indices/routes/entities/data-point.entity';

export function dataPointFactory(timestamp?: number, value?: number) {
  return <DataPoint>{
    timestamp: timestamp ?? faker.date.recent().getTime(),
    value: value ?? faker.datatype.number(),
  };
}
