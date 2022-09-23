import { PortfolioStatesRepository } from '../repositories/portfolio-states.repository';
import { PortfoliosRepository } from '../repositories/portfolios.repository';
import { PortfoliosService } from './portfolios.service';
import { PositionsService } from './positions.service';

describe('PortfoliosService', () => {
  const portfoliosRepository = {} as unknown as PortfoliosRepository;
  const portfolioStatesRepository = {} as unknown as PortfolioStatesRepository;
  const positionsService = {} as unknown as PositionsService;

  const mockedPortfoliosRepository = jest.mocked(portfoliosRepository);
  const mockedPortfolioStatesRepository = jest.mocked(
    portfolioStatesRepository,
  );
  const mockedPositionsService = jest.mocked(positionsService);

  const service: PortfoliosService = new PortfoliosService(
    mockedPortfoliosRepository,
    mockedPortfolioStatesRepository,
    mockedPositionsService,
  );

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
