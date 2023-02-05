import { faker } from '@faker-js/faker';
import { IndexPerformance } from '../index-performance.entity';

export function indexPerformanceFactory(
  timestamp?: number,
  value?: number,
): IndexPerformance {
  return {
    timestamp: timestamp ?? faker.date.recent().getTime(),
    value: value ?? faker.datatype.number(),
  };
}
