import { faker } from '@faker-js/faker';
import { AddPortfolioContributionDto } from '../add-portfolio-contribution.dto.js';

export function addPortfolioContributionDtoFactory(
  timestamp?: Date,
  amountEUR?: number,
): AddPortfolioContributionDto {
  return <AddPortfolioContributionDto>{
    timestamp: timestamp ?? faker.date.recent(),
    amountEUR: amountEUR ?? Number(faker.finance.amount()),
  };
}
