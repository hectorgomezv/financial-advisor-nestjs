import { faker } from '@faker-js/faker';
import { companyStateFactory } from '../../companies/domain/entities/__tests__/company-state.factory';
import { CompanyStatesRepository } from '../../companies/repositories/company-states.repository';
import { CurrencyExchangeClient } from '../datasources/currency-exchange.client';
import { PortfolioStatesRepository } from '../repositories/portfolio-states.repository';
import { TimeRange } from './entities/time-range.enum';
import { portfolioFactory } from './entities/__tests__/portfolio.factory';
import { positionFactory } from './entities/__tests__/position.factory';
import { PortfolioStatesService } from './portfolio-states.service';

describe('PortfolioStatesService', () => {
  const portfolioStatesRepository = jest.mocked({
    create: jest.fn(),
    getLastByPortfolioUuid: jest.fn(),
    getAverageBalancesForRange: jest.fn(),
    deleteByPortfolioUuid: jest.fn(),
  } as unknown as PortfolioStatesRepository);

  const exchangeClient = jest.mocked({
    getFx: jest.fn(),
  } as unknown as CurrencyExchangeClient);

  const companyStatesRepository = jest.mocked({
    getLastByCompanyUuids: jest.fn(),
  } as unknown as CompanyStatesRepository);

  const service: PortfolioStatesService = new PortfolioStatesService(
    portfolioStatesRepository,
    exchangeClient,
    companyStatesRepository,
  );

  describe('creation', () => {
    it('should create a portfolio state by summing up positions and calculating total value', async () => {
      const portfolio = portfolioFactory();
      const positions = [
        positionFactory(),
        positionFactory(),
        positionFactory(),
      ];
      const convertedTotalValueUSD = faker.datatype.number();
      const sumWeights = positions.reduce(
        (acc, pos) => acc + pos.targetWeight,
        0,
      );
      exchangeClient.getFx = jest.fn().mockReturnValue(() => ({
        from: jest.fn().mockReturnValue({
          to: jest.fn().mockReturnValue(convertedTotalValueUSD),
        }),
      }));
      companyStatesRepository.getLastByCompanyUuids.mockResolvedValue([
        companyStateFactory(
          faker.datatype.uuid(),
          Date.now(),
          faker.datatype.number(),
          faker.datatype.number(),
          'USD',
          positions[0].companyUuid,
        ),
        companyStateFactory(
          faker.datatype.uuid(),
          Date.now(),
          faker.datatype.number(),
          faker.datatype.number(),
          'USD',
          positions[1].companyUuid,
        ),
        companyStateFactory(
          faker.datatype.uuid(),
          Date.now(),
          faker.datatype.number(),
          faker.datatype.number(),
          'EUR',
          positions[2].companyUuid,
        ),
      ]);

      await service.createPortfolioState(portfolio, positions);

      expect(portfolioStatesRepository.create).toHaveBeenCalledTimes(1);
      expect(portfolioStatesRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          portfolioUuid: portfolio.uuid,
          isValid: sumWeights === 100,
          totalValueEUR: convertedTotalValueUSD + positions[2].value, // positions[2] is in EUR
          cash: portfolio.cash,
          roicEUR:
            convertedTotalValueUSD +
            positions[2].value + // positions[2] is in EUR
            portfolio.cash -
            portfolio.contributions.reduce((sum, i) => sum + i.amountEUR, 0),
        }),
      );
    });
  });

  describe('retrieving', () => {
    it('should call repository to retrieve the last state by portfolio uuid', async () => {
      const portfolio = portfolioFactory();
      await service.getLastByPortfolioUuid(portfolio.uuid);
      expect(
        portfolioStatesRepository.getLastByPortfolioUuid,
      ).toHaveBeenCalledWith(portfolio.uuid);
    });

    it('should call repository to retrieve portfolio average balances for range', async () => {
      const uuid = faker.datatype.uuid();
      await service.getAverageBalancesForRange(uuid, TimeRange.Week);
      expect(
        portfolioStatesRepository.getAverageBalancesForRange,
      ).toHaveBeenCalledWith(uuid, TimeRange.Week);
    });
  });

  describe('deleting', () => {
    it('should call repository for deleting all the states by portfolio uuid', async () => {
      const uuid = faker.datatype.uuid();
      await service.deleteByPortfolioUuid(uuid);
      expect(portfolioStatesRepository.deleteByPortfolioUuid).toBeCalledWith(
        uuid,
      );
    });
  });
});
