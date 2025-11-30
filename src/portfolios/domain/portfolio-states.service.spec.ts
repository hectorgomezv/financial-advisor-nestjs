import { faker } from '@faker-js/faker';
import Decimal from 'decimal.js';
import { PortfolioStatesPgRepository } from '../repositories/portfolio-states.pg.repository';
import { portfolioStateFactory } from './entities/__tests__/portfolio-state.factory';
import { portfolioFactory } from './entities/__tests__/portfolio.factory';
import { positionFactory } from './entities/__tests__/position.factory';
import { TimeRange } from './entities/time-range.enum';
import { PortfolioStatesService } from './portfolio-states.service';

describe('PortfolioStatesService', () => {
  const portfolioStatesRepository = jest.mocked({
    create: jest.fn(),
    getLastByPortfolioId: jest.fn(),
    getAverageBalancesForRange: jest.fn(),
    deleteByPortfolioId: jest.fn(),
  } as unknown as PortfolioStatesPgRepository);

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
      const totalValueEUR = positions.reduce(
        (sum, pos) => sum.plus(pos.value),
        portfolio.cash,
      );
      const sumWeights = positions
        .reduce((acc, pos) => acc.plus(pos.targetWeight), new Decimal(0))
        .toDecimalPlaces(2);

      await service.createPortfolioState(portfolio, positions);

      expect(portfolioStatesRepository.create).toHaveBeenCalledTimes(1);
      expect(portfolioStatesRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          portfolioId: portfolio.id,
          isValid: sumWeights.equals(100),
          totalValueEUR,
          cash: portfolio.cash,
          roicEUR: totalValueEUR.minus(
            portfolio.contributions.reduce(
              (sum, i) => sum.plus(i.amountEUR),
              new Decimal(0),
            ),
          ),
        }),
      );
    });
  });

  describe('retrieving', () => {
    it('should call repository to retrieve the last state by portfolio id', async () => {
      const portfolio = portfolioFactory();
      portfolioStatesRepository.getLastByPortfolioId.mockResolvedValue(
        portfolioStateFactory(),
      );

      await service.getLastByPortfolioId(portfolio.id);

      expect(
        portfolioStatesRepository.getLastByPortfolioId,
      ).toHaveBeenCalledWith(portfolio.id);
    });

    it('should call repository to retrieve portfolio average balances for range', async () => {
      const id = faker.number.int();
      await service.getAverageBalancesForRange(id, TimeRange.Week);
      expect(
        portfolioStatesRepository.getAverageBalancesForRange,
      ).toHaveBeenCalledWith(id, TimeRange.Week);
    });
  });
});
