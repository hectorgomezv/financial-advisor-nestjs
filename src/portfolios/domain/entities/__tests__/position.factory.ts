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
    uuid: uuid || faker.datatype.uuid(),
    portfolioUuid: portfolioUuid || faker.datatype.uuid(),
    companyUuid: companyUuid || faker.datatype.uuid(),
    targetWeight: targetWeight || faker.random.numeric(),
    shares: shares || faker.random.numeric(),
    symbol: symbol || faker.random.word(),
    value: value || faker.random.numeric(),
  };
}
