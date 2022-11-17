import { faker } from '@faker-js/faker';
import { PortfolioContribution } from '../portfolio-contribution.entity';

export function portfolioContributionFactory(
  portfolioUuid: string,
  created?: Date,
  amountEUR?: number,
): PortfolioContribution {
  return <PortfolioContribution>{
    portfolioUuid: portfolioUuid || faker.datatype.uuid(),
    created: created || Date.now(),
    amountEUR: amountEUR || Number(faker.finance.amount()),
  };
}
