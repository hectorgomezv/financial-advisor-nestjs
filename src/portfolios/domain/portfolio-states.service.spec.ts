import { CurrencyExchangeClient } from '../datasources/currency-exchange.client';
import { PortfolioStatesRepository } from '../repositories/portfolio-states.repository';
import { PortfolioStatesService } from './portfolio-states.service';

describe('PortfolioStatesService', () => {
  const exchangeClient = {} as unknown as CurrencyExchangeClient;
  const portfolioStatesRepository = {} as unknown as PortfolioStatesRepository;

  const mockedExchangeClient = jest.mocked(exchangeClient);
  const mockedPortfoliosRepository = jest.mocked(portfolioStatesRepository);

  const service: PortfolioStatesService = new PortfolioStatesService(
    mockedPortfoliosRepository,
    mockedExchangeClient,
  );

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
