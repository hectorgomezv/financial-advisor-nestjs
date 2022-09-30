import { PortfoliosRepository } from '../repositories/portfolios.repository';
import { PortfolioStatesService } from './portfolio-states.service';
import { PortfoliosService } from './portfolios.service';
import { PositionsService } from './positions.service';

describe('PortfoliosService', () => {
  const portfoliosRepository = {} as unknown as PortfoliosRepository;
  const portfolioStatesService = {} as unknown as PortfolioStatesService;
  const positionsService = {} as unknown as PositionsService;

  const mockedPortfoliosRepository = jest.mocked(portfoliosRepository);
  const mockedPortfolioStatesService = jest.mocked(portfolioStatesService);
  const mockedPositionsService = jest.mocked(positionsService);

  const service: PortfoliosService = new PortfoliosService(
    mockedPortfoliosRepository,
    mockedPortfolioStatesService,
    mockedPositionsService,
  );

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
