import { faker } from '@faker-js/faker';
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

  const service: PortfolioStatesService = new PortfolioStatesService(
    portfolioStatesRepository,
  );

  describe('creation', () => {
    it('should create a portfolio state by summing up positions and calculating total value', async () => {
      const portfolio = portfolioFactory();
      const positions = [
        positionFactory(),
        positionFactory(),
        positionFactory(),
      ];
      const totalValueEUR = positions.reduce((sum, pos) => sum + pos.value, 0);
      const sumWeights = positions.reduce(
        (acc, pos) => acc + pos.targetWeight,
        0,
      );

      await service.createPortfolioState(portfolio, positions);

      expect(portfolioStatesRepository.create).toHaveBeenCalledTimes(1);
      expect(portfolioStatesRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          portfolioUuid: portfolio.uuid,
          isValid: sumWeights === 100,
          totalValueEUR,
          cash: portfolio.cash,
          roicEUR:
            totalValueEUR +
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
      const uuid = faker.string.uuid();
      await service.getAverageBalancesForRange(uuid, TimeRange.Week);
      expect(
        portfolioStatesRepository.getAverageBalancesForRange,
      ).toHaveBeenCalledWith(uuid, TimeRange.Week);
    });
  });

  describe('deleting', () => {
    it('should call repository for deleting all the states by portfolio uuid', async () => {
      const uuid = faker.string.uuid();
      await service.deleteByPortfolioUuid(uuid);
      expect(portfolioStatesRepository.deleteByPortfolioUuid).toBeCalledWith(
        uuid,
      );
    });
  });
});
