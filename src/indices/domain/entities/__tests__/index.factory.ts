import { faker } from '@faker-js/faker';
import { DataPoint } from '../../../../common/domain/entities/data-point.entity.js';
import { dataPointFactory } from '../../../../common/domain/entities/__tests__/data-point.factory.js';
import { Index } from '../index.entity.js';
import _ from 'lodash';
const { random, range } = _;

export function indexFactory(
  uuid?: string,
  name?: string,
  symbol?: string,
  values?: DataPoint[],
) {
  return <Index>{
    uuid: uuid ?? faker.string.uuid(),
    name: name ?? faker.word.sample(),
    symbol: symbol ?? faker.word.sample(),
    values: values ?? range(random(4)).map(() => dataPointFactory()),
  };
}
