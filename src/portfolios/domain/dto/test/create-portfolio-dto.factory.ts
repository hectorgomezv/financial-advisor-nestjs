import { faker } from '@faker-js/faker';
import { CreatePortfolioDto } from '../create-portfolio.dto';

export function createPortfolioDtoFactory(
  name?: string,
  seed?: number,
): CreatePortfolioDto {
  return <CreatePortfolioDto>{
    name: name ?? faker.random.words(),
    seed: seed ?? Number(faker.finance.amount()),
  };
}
