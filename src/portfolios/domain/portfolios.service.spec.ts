import { faker } from '@faker-js/faker';
import Decimal from 'decimal.js';
import { random, range } from 'lodash';
import { AuthService } from '../../common/auth/auth-service';
import { User, UserRole } from '../../common/auth/entities/user.entity';
import { dataPointFactory } from '../../common/domain/entities/__tests__/data-point.factory';
import { Maths } from '../../common/domain/entities/maths.entity';
import { TimePeriod } from '../../common/domain/entities/time-period.entity';
import { indexFactory } from '../../indices/domain/entities/__tests__/index.factory';
import { IndicesService } from '../../indices/domain/indices.service';
import { PortfoliosPgRepository } from '../repositories/portfolios.pg.repository';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { PortfolioDetailResult } from './dto/portfolio-detail-result.dto';
import { addPortfolioContributionDtoFactory } from './dto/test/add-portfolio-contribution.dto.factory';
import { positionDetailResultFactory } from './dto/test/position-detail-result.factory';
import { updatePortfolioCashDtoFactory } from './dto/test/update-portfolio-cash.dto.factory';
import { portfolioAverageBalanceFactory } from './entities/__tests__/portfolio-average-metric.factory';
import { portfolioContributionFactory } from './entities/__tests__/portfolio-contribution.factory';
import { portfolioStateResultFactory } from './entities/__tests__/portfolio-state-result.factory';
import { portfolioStateFactory } from './entities/__tests__/portfolio-state.factory';
import { portfolioFactory } from './entities/__tests__/portfolio.factory';
import { ContributionsMetadata } from './entities/contributions-metadata';
import { Portfolio } from './entities/portfolio.entity';
import { PortfolioStatesService } from './portfolio-states.service';
import { PortfoliosService } from './portfolios.service';
import { PositionsService } from './positions.service';

describe('PortfoliosService', () => {
  const portfoliosRepository = jest.mocked({
    create: jest.fn(),
    findByOwnerId: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByIdWithContributions: jest.fn(),
    deleteById: jest.fn(),
    updateCash: jest.fn(),
    getContributions: jest.fn(),
    getContributionsMetadata: jest.fn(),
    addContribution: jest.fn(),
    deleteContributionById: jest.fn(),
  } as unknown as PortfoliosPgRepository);

  const portfolioStatesService = jest.mocked({
    getLastByPortfolioId: jest.fn(),
    deleteByPortfolioId: jest.fn(),
    getAverageBalancesForRange: jest.fn(),
    getPortfolioStatesInPeriod: jest.fn(),
  } as unknown as PortfolioStatesService);

  const positionsService = jest.mocked({
    getPositionDetailsByPortfolioId: jest.fn(),
    deleteByPortfolioId: jest.fn(),
    updatePortfolioState: jest.fn(),
  } as unknown as PositionsService);

  const indicesService = jest.mocked({
    findAll: jest.fn(),
    getIndexPerformanceForTimestamps: jest.fn(),
  } as unknown as IndicesService);

  const adminUser = <User>{
    id: faker.string.uuid(),
    email: faker.internet.email(),
    role: UserRole.ADMIN,
  };

  const adminUserPortfolio = portfolioFactory(
    faker.number.int(),
    faker.word.sample(),
    adminUser.id,
  );

  const service: PortfoliosService = new PortfoliosService(
    portfoliosRepository,
    new AuthService(),
    portfolioStatesService,
    positionsService,
    indicesService,
  );

  describe('creation', () => {
    it('should call repository for creation with the right values', async () => {
      const portfolio = portfolioFactory();
      const dto = <CreatePortfolioDto>{
        name: faker.word.words(),
      };
      portfoliosRepository.create.mockResolvedValueOnce(portfolio);

      const created = await service.create(adminUser, dto);

      expect(created).toBe(portfolio);
      expect(portfoliosRepository.create).toHaveBeenCalledTimes(1);
      expect(portfoliosRepository.create).toHaveBeenCalledWith(
        { name: dto.name },
        expect.objectContaining({ id: adminUser.id }),
      );
    });
  });

  describe('retrieving', () => {
    it('should call repository for retrieving the users portfolios', async () => {
      const portfolios = [portfolioFactory(), portfolioFactory()];
      portfoliosRepository.findByOwnerId.mockResolvedValueOnce(portfolios);
      const user: User = { ...adminUser, role: UserRole.USER };

      const retrieved = await service.findByOwnerId(user);

      expect(retrieved).toBe(portfolios);
      expect(portfoliosRepository.findByOwnerId).toHaveBeenCalledTimes(1);
    });

    it('should call repository for retrieving all the portfolios', async () => {
      const portfolios = [portfolioFactory(), portfolioFactory()];
      portfoliosRepository.findAll.mockResolvedValueOnce(portfolios);

      const retrieved = await service.findByOwnerId(adminUser);

      expect(retrieved).toBe(portfolios);
      expect(portfoliosRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it("should fail if the portfolio don't exist", async () => {
      portfoliosRepository.findById.mockResolvedValueOnce(null);

      await expect(
        service.findById(adminUser, faker.number.int()),
      ).rejects.toThrow('Portfolio not found');
    });

    it("should fail if the user doesn't owns the portfolio", async () => {
      portfoliosRepository.findById.mockResolvedValueOnce({
        ...adminUserPortfolio,
        ownerId: faker.string.uuid(),
      });

      await expect(
        service.findById(adminUser, faker.number.int()),
      ).rejects.toThrow('Access denied');
    });

    it('should call repository for retrieving one portfolio with its positions', async () => {
      const positions = [
        positionDetailResultFactory(),
        positionDetailResultFactory(),
      ];
      const state = portfolioStateResultFactory();
      portfoliosRepository.findById.mockResolvedValueOnce(adminUserPortfolio);
      positionsService.getPositionDetailsByPortfolioId.mockResolvedValueOnce(
        positions,
      );
      portfolioStatesService.getLastByPortfolioId.mockResolvedValueOnce(state);

      const retrieved = await service.findById(
        adminUser,
        adminUserPortfolio.id,
      );

      expect(retrieved).toEqual(<PortfolioDetailResult>{
        id: adminUserPortfolio.id,
        name: adminUserPortfolio.name,
        cash: Maths.round(adminUserPortfolio.cash),
        created: adminUserPortfolio.created,
        positions,
        state,
      });
    });

    it("should fail if the portfolio don't exist when getting metrics from repository", async () => {
      portfoliosRepository.findByIdWithContributions.mockResolvedValueOnce(
        null,
      );

      await expect(
        service.getAverageBalances(
          adminUser,
          faker.number.int(),
          faker.word.sample(),
        ),
      ).rejects.toThrow('Portfolio not found');
    });

    it('should call repository to get portfolio metrics, sum contributions, and sort result', async () => {
      const portfolioAverageBalances = [
        portfolioAverageBalanceFactory(new Date(2022, 0, 2), new Decimal(200)),
        portfolioAverageBalanceFactory(new Date(2022, 0, 1), new Decimal(100)),
        portfolioAverageBalanceFactory(new Date(2022, 0, 5), new Decimal(300)),
        portfolioAverageBalanceFactory(new Date(2022, 0, 6), new Decimal(200)),
        portfolioAverageBalanceFactory(new Date(2022, 0, 8), new Decimal(400)),
      ];
      portfoliosRepository.findByIdWithContributions.mockResolvedValueOnce({
        ...adminUserPortfolio,
        contributions: [
          portfolioContributionFactory(
            faker.number.int(),
            new Date(2022, 0, 2),
            new Decimal(100),
          ),
          portfolioContributionFactory(
            faker.number.int(),
            new Date(2022, 0, 4),
            new Decimal(100),
          ),
          portfolioContributionFactory(
            faker.number.int(),
            new Date(2022, 0, 7),
            new Decimal(200),
          ),
        ],
      });
      portfolioStatesService.getAverageBalancesForRange.mockResolvedValueOnce(
        portfolioAverageBalances,
      );

      const metrics = await service.getAverageBalances(
        adminUser,
        faker.number.int(),
        faker.word.sample(),
      );

      const expected = [
        {
          ...portfolioAverageBalances[1],
          contributions: new Decimal(0),
        },
        {
          ...portfolioAverageBalances[0],
          contributions: new Decimal(100),
        },
        {
          ...portfolioAverageBalances[2],
          contributions: new Decimal(200),
        },
        {
          ...portfolioAverageBalances[3],
          contributions: new Decimal(200),
        },
        {
          ...portfolioAverageBalances[4],
          contributions: new Decimal(400),
        },
      ];
      expect(metrics).toEqual(expected);
    });

    it('should call repository to get portfolio metrics', async () => {
      const portfolioAverageBalances = [
        portfolioAverageBalanceFactory(new Date(2022, 0, 1), new Decimal(60)),
        portfolioAverageBalanceFactory(new Date(2022, 0, 3), new Decimal(90)),
        portfolioAverageBalanceFactory(new Date(2022, 0, 4), new Decimal(60)),
        portfolioAverageBalanceFactory(new Date(2022, 0, 6), new Decimal(90)),
        portfolioAverageBalanceFactory(new Date(2022, 0, 5), new Decimal(45)),
        portfolioAverageBalanceFactory(new Date(2022, 0, 1), new Decimal(120)),
      ];
      portfoliosRepository.findById.mockResolvedValueOnce(adminUserPortfolio);
      portfolioStatesService.getAverageBalancesForRange.mockResolvedValueOnce(
        portfolioAverageBalances,
      );
      const indices = [indexFactory(), indexFactory()];
      const indexPerformance = range(random(5, 10)).map(() =>
        dataPointFactory(),
      );
      indicesService.findAll.mockResolvedValueOnce(indices);
      indicesService.getIndexPerformanceForTimestamps.mockResolvedValue(
        indexPerformance,
      );

      const performance = await service.getPerformance(
        adminUser,
        faker.number.int(),
        faker.word.sample(),
      );

      const expected = [
        expect.objectContaining(dataPointFactory(new Date(2022, 0, 1), 0)),
        expect.objectContaining(dataPointFactory(new Date(2022, 0, 1), 100)),
        expect.objectContaining(dataPointFactory(new Date(2022, 0, 3), 50)),
        expect.objectContaining(dataPointFactory(new Date(2022, 0, 4), 0)),
        expect.objectContaining(dataPointFactory(new Date(2022, 0, 5), -25)),
        expect.objectContaining(dataPointFactory(new Date(2022, 0, 6), 50)),
      ];

      expect(performance).toEqual(expected);
    });

    it("should fail if the portfolio don't exist when getting contributions from repository", async () => {
      portfoliosRepository.findById.mockResolvedValueOnce(null);

      await expect(
        service.getContributions(
          adminUser,
          faker.number.int(),
          faker.number.int(),
          faker.number.int(),
        ),
      ).rejects.toThrow('Portfolio not found');
    });

    it('should call repository to get portfolio contributions', async () => {
      const portfolioContributions = [
        portfolioContributionFactory(adminUserPortfolio.id),
        portfolioContributionFactory(adminUserPortfolio.id),
      ];
      portfoliosRepository.findById.mockResolvedValueOnce(adminUserPortfolio);
      portfoliosRepository.getContributions.mockResolvedValueOnce(
        portfolioContributions,
      );

      const actual = await service.getContributions(
        adminUser,
        faker.number.int(),
        faker.number.int(),
        faker.number.int(),
      );

      expect(actual).toEqual(portfolioContributions);
    });

    it('should call repository to get portfolio contributions count', async () => {
      const count = faker.number.int();
      const sum = faker.number.int();
      const contributionsMetadata = new ContributionsMetadata(
        count,
        new Decimal(sum),
      );
      portfoliosRepository.findById.mockResolvedValueOnce(adminUserPortfolio);
      portfoliosRepository.getContributionsMetadata.mockResolvedValueOnce(
        contributionsMetadata,
      );

      const actual = await service.getContributionsMetadata(
        adminUser,
        faker.number.int(),
      );

      expect(actual).toEqual(contributionsMetadata);
    });

    it('should get return rates properly with no contributions on monthly intervals', async () => {
      const portfolio: Portfolio = {
        ...portfolioFactory(),
        ownerId: adminUser.id,
        contributions: [],
      };

      const portfolioStates = [
        10000, 10100, 10200, 10300, 10400, 10500, 10400, 10300, 10200, 10000,
        100000, 50000,
      ].map((value, n) => ({
        ...portfolioStateFactory(),
        timestamp: new Date(2022, n, 1),
        totalValueEUR: new Decimal(value),
      }));

      indicesService.findAll.mockResolvedValueOnce([
        indexFactory(),
        indexFactory(),
        indexFactory(),
      ]);
      indicesService.getIndexPerformanceForTimestamps.mockResolvedValue([]);
      portfoliosRepository.findByIdWithContributions.mockResolvedValueOnce(
        portfolio,
      );
      portfolioStatesService.getPortfolioStatesInPeriod.mockResolvedValueOnce(
        portfolioStates,
      );

      const expected = expect.arrayContaining([
        expect.objectContaining({
          timestamp: new Date(2022, 1, 1),
          value: 0,
        }),
        expect.objectContaining({
          timestamp: new Date(2022, 2, 1),
          value: expect.closeTo(1),
        }),
        expect.objectContaining({
          timestamp: new Date(2022, 3, 1),
          value: expect.closeTo(2),
        }),
        expect.objectContaining({
          timestamp: new Date(2022, 4, 1),
          value: expect.closeTo(3),
        }),
        expect.objectContaining({
          timestamp: new Date(2022, 5, 1),
          value: expect.closeTo(4),
        }),
        expect.objectContaining({
          timestamp: new Date(2022, 6, 1),
          value: expect.closeTo(5),
        }),
        expect.objectContaining({
          timestamp: new Date(2022, 7, 1),
          value: expect.closeTo(4),
        }),
        expect.objectContaining({
          timestamp: new Date(2022, 8, 1),
          value: expect.closeTo(3),
        }),
        expect.objectContaining({
          timestamp: new Date(2022, 9, 1),
          value: expect.closeTo(2),
        }),
        expect.objectContaining({
          timestamp: new Date(2022, 10, 1),
          value: 0,
        }),
        expect.objectContaining({
          timestamp: new Date(2022, 11, 1),
          value: 900,
        }),
        expect.objectContaining({
          timestamp: new Date(2023, 0, 1),
          value: 400,
        }),
      ]);

      const actual = await service.getReturnRates(
        adminUser,
        portfolio.id,
        TimePeriod.from(new Date(2022, 0, 1), new Date(2023, 0, 5)),
      );

      expect(actual).toEqual(expected);
    });

    it('should get return rates properly with no contributions on weekly intervals', async () => {
      const portfolio: Portfolio = {
        ...portfolioFactory(),
        ownerId: adminUser.id,
        contributions: [],
      };
      const portfolioStates = [10000, 10200, 10200, 10300].map((value, n) => ({
        ...portfolioStateFactory(),
        timestamp: new Date(2022, n, 1),
        totalValueEUR: new Decimal(value),
      }));
      const indices = [indexFactory(), indexFactory()];

      portfoliosRepository.findByIdWithContributions.mockResolvedValueOnce(
        portfolio,
      );
      portfolioStatesService.getPortfolioStatesInPeriod.mockResolvedValueOnce(
        portfolioStates,
      );
      indicesService.findAll.mockResolvedValueOnce(indices);

      const expected = expect.arrayContaining([
        expect.objectContaining({
          timestamp: new Date(2022, 0, 2),
          value: 0,
        }),
        expect.objectContaining({
          timestamp: new Date(2022, 0, 9),
          value: 0,
        }),
        expect.objectContaining({
          timestamp: new Date(2022, 0, 16),
          value: 0,
        }),
        expect.objectContaining({
          timestamp: new Date(2022, 0, 23),
          value: 0,
        }),
        expect.objectContaining({
          timestamp: new Date(2022, 0, 30),
          value: 0,
        }),
        expect.objectContaining({
          timestamp: new Date(2022, 1, 6),
          value: expect.closeTo(2),
        }),
        expect.objectContaining({
          timestamp: new Date(2022, 1, 13),
          value: expect.closeTo(2),
        }),
        expect.objectContaining({
          timestamp: new Date(2022, 1, 20),
          value: expect.closeTo(2),
        }),
        expect.objectContaining({
          timestamp: new Date(2022, 1, 27),
          value: expect.closeTo(2),
        }),
        expect.objectContaining({
          timestamp: new Date(2022, 2, 6),
          value: expect.closeTo(2),
        }),
        expect.objectContaining({
          timestamp: new Date(2022, 2, 13),
          value: expect.closeTo(2),
        }),
        expect.objectContaining({
          timestamp: new Date(2022, 2, 20),
          value: expect.closeTo(2),
        }),
        expect.objectContaining({
          timestamp: new Date(2022, 2, 27),
          value: expect.closeTo(2),
        }),
        expect.objectContaining({
          timestamp: new Date(2022, 3, 3),
          value: expect.closeTo(3),
        }),
        expect.objectContaining({
          timestamp: new Date(2022, 3, 10),
          value: expect.closeTo(3),
        }),
      ]);

      const actual = await service.getReturnRates(
        adminUser,
        portfolio.id,
        TimePeriod.from(new Date(2022, 0, 1), new Date(2022, 3, 10)),
      );

      expect(actual).toEqual(expected);
    });

    it('should get return rates properly with contributions on monthly intervals', async () => {
      const portfolio: Portfolio = {
        ...portfolioFactory(),
        ownerId: adminUser.id,
        contributions: [
          new Date(2022, 1, 5),
          new Date(2022, 2, 5),
          new Date(2022, 9, 5),
        ].map((date) => ({
          ...portfolioContributionFactory(),
          timestamp: new Date(date),
          amountEUR: new Decimal(100),
        })),
      };

      const portfolioStates = [
        10000, 10085, 10287, 10339, 10600, 10600, 10600, 10600, 10600, 10600,
        10600, 10600,
      ].map((value, n) => ({
        ...portfolioStateFactory(),
        timestamp: new Date(2022, n, 1),
        totalValueEUR: new Decimal(value),
      }));

      indicesService.findAll.mockResolvedValueOnce([indexFactory()]);
      indicesService.getIndexPerformanceForTimestamps.mockResolvedValueOnce([]);
      portfoliosRepository.findByIdWithContributions.mockResolvedValueOnce(
        portfolio,
      );
      portfolioStatesService.getPortfolioStatesInPeriod.mockResolvedValueOnce(
        portfolioStates,
      );

      const expected = expect.arrayContaining([
        expect.objectContaining({
          timestamp: new Date(2022, 1, 1),
          value: 0,
        }),
        expect.objectContaining({
          timestamp: new Date(2022, 2, 1),
          value: expect.closeTo(0.85),
        }),
        expect.objectContaining({
          timestamp: new Date(2022, 3, 1),
          value: expect.closeTo(1.86),
        }),
        expect.objectContaining({
          timestamp: new Date(2022, 4, 1),
          value: expect.closeTo(1.39),
        }),
        expect.objectContaining({
          timestamp: new Date(2022, 5, 1),
          value: expect.closeTo(3.95),
        }),
        expect.objectContaining({
          timestamp: new Date(2022, 6, 1),
          value: expect.closeTo(3.95),
        }),
        expect.objectContaining({
          timestamp: new Date(2022, 7, 1),
          value: expect.closeTo(3.95),
        }),
        expect.objectContaining({
          timestamp: new Date(2022, 8, 1),
          value: expect.closeTo(3.95),
        }),
        expect.objectContaining({
          timestamp: new Date(2022, 9, 1),
          value: expect.closeTo(3.95),
        }),
        expect.objectContaining({
          timestamp: new Date(2022, 10, 1),
          value: expect.closeTo(3.95),
        }),
        expect.objectContaining({
          timestamp: new Date(2022, 11, 1),
          value: expect.closeTo(2.98),
        }),
        expect.objectContaining({
          timestamp: new Date(2023, 0, 1),
          value: expect.closeTo(2.98),
        }),
      ]);

      const actual = await service.getReturnRates(
        adminUser,
        portfolio.id,
        TimePeriod.from(new Date(2022, 0, 1), new Date(2023, 0, 5)),
      );

      expect(actual).toEqual(expected);
    });

    it('should get return rates properly with contributions on monthly intervals (2)', async () => {
      const portfolio: Portfolio = {
        ...portfolioFactory(),
        ownerId: adminUser.id,
        contributions: [
          new Date(2022, 5, 5),
          new Date(2022, 7, 5),
          // new Date(2022, 9, 5),
        ].map((date) => ({
          ...portfolioContributionFactory(),
          timestamp: new Date(date),
          amountEUR: new Decimal(100),
        })),
      };

      const portfolioStates = [
        10000, 9000, 8000, 9000, 11000, 10000, 10000, 10000, 10000, 10000,
        11000, 11000,
      ].map((value, n) => ({
        ...portfolioStateFactory(),
        timestamp: new Date(2022, n, 2),
        totalValueEUR: new Decimal(value),
      }));

      indicesService.findAll.mockResolvedValueOnce([indexFactory()]);
      indicesService.getIndexPerformanceForTimestamps.mockResolvedValueOnce([]);
      portfoliosRepository.findByIdWithContributions.mockResolvedValueOnce(
        portfolio,
      );
      portfolioStatesService.getPortfolioStatesInPeriod.mockResolvedValueOnce(
        portfolioStates,
      );

      const expected = expect.arrayContaining([
        expect.objectContaining({
          timestamp: new Date(2022, 1, 1),
          value: 0,
        }),
        expect.objectContaining({
          timestamp: new Date(2022, 2, 1),
          value: expect.closeTo(-10),
        }),
        expect.objectContaining({
          timestamp: new Date(2022, 3, 1),
          value: expect.closeTo(-20),
        }),
        expect.objectContaining({
          timestamp: new Date(2022, 4, 1),
          value: expect.closeTo(-10),
        }),
        expect.objectContaining({
          timestamp: new Date(2022, 5, 1),
          value: expect.closeTo(10),
        }),
        expect.objectContaining({
          timestamp: new Date(2022, 6, 1),
          value: expect.closeTo(0),
        }),
        expect.objectContaining({
          timestamp: new Date(2022, 7, 1),
          value: expect.closeTo(-0.99),
        }),
        expect.objectContaining({
          timestamp: new Date(2022, 8, 1),
          value: expect.closeTo(-0.99),
        }),
        expect.objectContaining({
          timestamp: new Date(2022, 9, 1),
          value: expect.closeTo(-1.97),
        }),
        expect.objectContaining({
          timestamp: new Date(2022, 10, 1),
          value: expect.closeTo(-1.97),
        }),
        expect.objectContaining({
          timestamp: new Date(2022, 11, 1),
          value: expect.closeTo(7.83),
        }),
        expect.objectContaining({
          timestamp: new Date(2023, 0, 1),
          value: expect.closeTo(7.83),
        }),
      ]);

      const actual = await service.getReturnRates(
        adminUser,
        portfolio.id,
        TimePeriod.from(new Date(2022, 0, 1), new Date(2023, 0, 5)),
      );

      expect(actual).toEqual(expected);
    });
  });

  describe('update', () => {
    it('should fail if the portfolio does not exist when updating cash', async () => {
      const dto = updatePortfolioCashDtoFactory();
      portfoliosRepository.findById.mockResolvedValueOnce(null);

      await expect(
        service.updateCash(adminUser, faker.number.int(), dto),
      ).rejects.toThrow('Portfolio not found');
    });

    it('should call repo to update cash', async () => {
      const id = faker.number.int();
      const dto = updatePortfolioCashDtoFactory();
      portfoliosRepository.findById.mockResolvedValueOnce(adminUserPortfolio);

      const actual = await service.updateCash(adminUser, id, dto);

      expect(actual).toEqual({ ...adminUserPortfolio, cash: dto.cash });
      expect(portfoliosRepository.updateCash).toHaveBeenCalledWith(
        id,
        dto.cash,
      );
      expect(positionsService.updatePortfolioState).toHaveBeenCalledWith({
        ...adminUserPortfolio,
        cash: dto.cash,
      });
    });

    it('should fail if the portfolio does not exist when adding a contribution', async () => {
      const dto = addPortfolioContributionDtoFactory();
      portfoliosRepository.findById.mockResolvedValueOnce(null);

      await expect(
        service.addContribution(adminUser, faker.number.int(), dto),
      ).rejects.toThrow('Portfolio not found');
    });

    it('should call repo to add a contribution', async () => {
      const id = faker.number.int();
      const dto = addPortfolioContributionDtoFactory();
      const expected = {
        ...adminUserPortfolio,
        contributions: [
          expect.objectContaining({
            uuid: expect.any(String),
            timestamp: dto.timestamp,
            amountEUR: dto.amountEUR,
          }),
        ],
      };
      portfoliosRepository.findById.mockResolvedValueOnce(adminUserPortfolio);
      portfoliosRepository.findByIdWithContributions.mockResolvedValueOnce(
        expected,
      );

      const actual = await service.addContribution(adminUser, id, dto);

      expect(actual).toEqual(expected);
      expect(portfoliosRepository.addContribution).toHaveBeenCalledWith(id, {
        timestamp: dto.timestamp,
        amountEUR: dto.amountEUR,
      });
      expect(positionsService.updatePortfolioState).toBeCalledWith(expected);
    });

    it('should call repo to delete a contribution', async () => {
      const portfolioUuid = faker.number.int();
      const contributionId = faker.number.int();
      const expected = { ...adminUserPortfolio, contributions: [] };
      portfoliosRepository.findById.mockResolvedValueOnce(adminUserPortfolio);
      portfoliosRepository.findById.mockResolvedValueOnce(expected);

      const actual = await service.deleteContribution(
        adminUser,
        portfolioUuid,
        contributionId,
      );

      expect(actual).toEqual(expected);
      expect(portfoliosRepository.deleteContributionById).toHaveBeenCalledWith(
        contributionId,
      );
      expect(positionsService.updatePortfolioState).toHaveBeenCalledWith(
        expected,
      );
    });
  });

  describe('deletion', () => {
    it("should fail if the portfolio don't exist", async () => {
      portfoliosRepository.findById.mockResolvedValueOnce(null);

      await expect(
        service.deleteOne(adminUser, faker.number.int()),
      ).rejects.toThrow('Portfolio not found');
    });

    it('should delete the portfolio', async () => {
      portfoliosRepository.findById.mockResolvedValueOnce(adminUserPortfolio);
      await service.deleteOne(adminUser, adminUserPortfolio.id);
    });
  });
});
