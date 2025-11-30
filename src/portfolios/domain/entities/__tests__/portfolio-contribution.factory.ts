import { faker } from '@faker-js/faker';
import { PortfolioContribution } from '../portfolio-contribution.entity';
import Decimal from 'decimal.js';

export function portfolioContributionFactory(
  id?: number,
  timestamp?: Date,
  amountEUR?: Decimal,
): PortfolioContribution {
  return <PortfolioContribution>{
    id: id ?? faker.number.int(),
    timestamp: timestamp ?? new Date(),
    amountEUR: amountEUR ?? new Decimal(faker.finance.amount()),
  };
}
