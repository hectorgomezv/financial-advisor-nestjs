import { faker } from '@faker-js/faker';
import { UpdatePortfolioCashDto } from '../update-portfolio-cash.dto';
import Decimal from 'decimal.js';

export function updatePortfolioCashDtoFactory(
  cash?: Decimal,
): UpdatePortfolioCashDto {
  return <UpdatePortfolioCashDto>{
    cash: cash ?? new Decimal(faker.finance.amount()),
  };
}
