import { faker } from '@faker-js/faker';
import { AddPortfolioContributionDto } from '../add-portfolio-contribution.dto';

export function addPortfolioContributionDtoFactory(
  timestamp?: number,
  amountEUR?: number,
): AddPortfolioContributionDto {
  return <AddPortfolioContributionDto>{
    timestamp: timestamp ?? faker.date.recent().getTime(),
    amountEUR: amountEUR ?? Number(faker.finance.amount()),
  };
}
