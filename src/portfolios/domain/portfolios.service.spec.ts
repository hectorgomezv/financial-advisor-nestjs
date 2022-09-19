import { PortfoliosRepository } from '../repositories/portfolios.repository';
import { PortfoliosService } from './portfolios.service';

describe('PortfoliosService', () => {
  const portfoliosRepository = {} as unknown as PortfoliosRepository;
  const mockedPortfoliosRepository = jest.mocked(portfoliosRepository);
  const service: PortfoliosService = new PortfoliosService(
    mockedPortfoliosRepository,
  );

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
