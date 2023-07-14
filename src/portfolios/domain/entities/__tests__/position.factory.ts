import { Position } from '../position.entity';
import { faker } from '@faker-js/faker';

export function positionFactory(
  uuid?: string,
  portfolioUuid?: string,
  targetWeight?: number,
  shares?: number,
  companyUuid?: string,
  symbol?: string,
  value?: number,
): Position {
  return <Position>{
    uuid: uuid ?? faker.string.uuid(),
    portfolioUuid: portfolioUuid ?? faker.string.uuid(),
    companyUuid: companyUuid ?? faker.string.uuid(),
    targetWeight: targetWeight ?? faker.number.int(),
    shares: shares ?? faker.number.int(),
    symbol: symbol ?? faker.word.sample(),
    value: value ?? faker.number.int(),
  };
}
