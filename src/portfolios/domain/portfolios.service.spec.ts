import { PortfolioStatesRepository } from '../repositories/portfolio-states.repository';
import { PortfoliosRepository } from '../repositories/portfolios.repository';
import { PortfoliosService } from './portfolios.service';

describe('PortfoliosService', () => {
  const portfoliosRepository = {} as unknown as PortfoliosRepository;
  const mockedPortfoliosRepository = jest.mocked(portfoliosRepository);

  const portfolioStatesRepository = {} as unknown as PortfolioStatesRepository;
  const mockedPortfolioStatesRepository = jest.mocked(
    portfolioStatesRepository,
  );

  const service: PortfoliosService = new PortfoliosService(
    mockedPortfoliosRepository,
    mockedPortfolioStatesRepository,
  );

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
