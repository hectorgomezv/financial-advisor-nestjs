import { faker } from '@faker-js/faker';
import { PositionDetailDto } from '../position-detail.dto';

export function positionDetailDtoFactory(
  uuid?: string,
  companyName?: string,
  symbol?: string,
  shares?: number,
  value?: number,
  targetWeight?: number,
  currentWeight?: number,
  deltaWeight?: number,
): PositionDetailDto {
  return <PositionDetailDto>{
    uuid: uuid || faker.datatype.uuid(),
    companyName: companyName || faker.datatype.uuid(),
    symbol: symbol || faker.random.word(),
    shares: shares || faker.datatype.number(),
    value: value || faker.datatype.number(),
    targetWeight: targetWeight || faker.datatype.number(),
    currentWeight: currentWeight || faker.datatype.number(),
    deltaWeight: deltaWeight || faker.datatype.number(),
  };
}
