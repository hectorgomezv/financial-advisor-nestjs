import { faker } from '@faker-js/faker';
import { CreatePortfolioDto } from '../create-portfolio.dto';

export function createPortfolioDtoFactory(name?: string): CreatePortfolioDto {
  return <CreatePortfolioDto>{
    name: name ?? faker.word.words(),
  };
}
