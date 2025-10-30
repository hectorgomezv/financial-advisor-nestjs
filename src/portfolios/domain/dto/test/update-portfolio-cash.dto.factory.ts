import { faker } from '@faker-js/faker';
import { UpdatePortfolioCashDto } from '../update-portfolio-cash.dto.js';

export function updatePortfolioCashDtoFactory(
  cash?: number,
): UpdatePortfolioCashDto {
  return <UpdatePortfolioCashDto>{
    cash: cash ?? Number(faker.finance.amount()),
  };
}
