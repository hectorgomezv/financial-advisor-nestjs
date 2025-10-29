import { faker } from '@faker-js/faker';
import { CreatePortfolioDto } from '../create-portfolio.dto.js';

export function createPortfolioDtoFactory(name?: string): CreatePortfolioDto {
  return <CreatePortfolioDto>{
    name: name ?? faker.word.words(),
  };
}
