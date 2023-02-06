import { faker } from '@faker-js/faker';
import { random, range } from 'lodash';
import { DataPoint } from '../../../../common/domain/entities/data-point.entity';
import { dataPointFactory } from '../../../../common/domain/entities/__tests__/data-point.factory';
import { Index } from '../index.entity';

export function indexFactory(
  uuid?: string,
  name?: string,
  symbol?: string,
  values?: DataPoint[],
) {
  return <Index>{
    uuid: uuid ?? faker.datatype.uuid(),
    name: name ?? faker.random.word(),
    symbol: symbol ?? faker.random.word(),
    values: values ?? range(random(4)).map(() => dataPointFactory()),
  };
}
