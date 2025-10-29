import { faker } from '@faker-js/faker';
import { PortfolioContribution } from '../portfolio-contribution.entity.js';

export function portfolioContributionFactory(
  uuid?: string,
  timestamp?: Date,
  amountEUR?: number,
): PortfolioContribution {
  return <PortfolioContribution>{
    uuid: uuid ?? faker.string.uuid(),
    timestamp: timestamp ?? new Date(),
    amountEUR: amountEUR ?? Number(faker.finance.amount()),
  };
}
