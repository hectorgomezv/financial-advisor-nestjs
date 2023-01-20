import { faker } from '@faker-js/faker';
import { PortfolioContribution } from '../portfolio-contribution.entity';

export function portfolioContributionFactory(
  uuid: string,
  timestamp?: Date,
  amountEUR?: number,
): PortfolioContribution {
  return <PortfolioContribution>{
    uuid: uuid ?? faker.datatype.uuid(),
    timestamp: timestamp ?? Date.now(),
    amountEUR: amountEUR ?? Number(faker.finance.amount()),
  };
}
