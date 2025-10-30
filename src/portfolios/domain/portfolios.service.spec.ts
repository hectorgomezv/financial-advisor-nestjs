import { faker } from '@faker-js/faker';
import { random, range } from 'lodash';
import { AuthService } from '../../common/auth/auth-service.js';
import { User, UserRole } from '../../common/auth/entities/user.entity.js';
import { TimePeriod } from '../../common/domain/entities/time-period.entity.js';
import { dataPointFactory } from '../../common/domain/entities/__tests__/data-point.factory.js';
import { indexFactory } from '../../indices/domain/entities/__tests__/index.factory.js';
import { IndicesService } from '../../indices/domain/indices.service.js';
import { PortfoliosRepository } from '../repositories/portfolios.repository.js';
import { CreatePortfolioDto } from './dto/create-portfolio.dto.js';
import { PortfolioDetailDto } from './dto/portfolio-detail.dto.js';
import { addPortfolioContributionDtoFactory } from './dto/test/add-portfolio-contribution.dto.factory.js';
import { positionDetailDtoFactory } from './dto/test/position-detail-dto.factory.js';
import { updatePortfolioCashDtoFactory } from './dto/test/update-portfolio-cash.dto.factory.js';
import { ContributionsMetadata } from './entities/contributions-metadata.js';
import { Portfolio } from './entities/portfolio.entity.js';
import { portfolioAverageBalanceFactory } from './entities/__tests__/portfolio-average-metric.factory.js';
import { portfolioContributionFactory } from './entities/__tests__/portfolio-contribution.factory.js';
import { portfolioStateFactory } from './entities/__tests__/portfolio-state.factory.js';
import { portfolioFactory } from './entities/__tests__/portfolio.factory.js';
import { PortfolioStatesService } from './portfolio-states.service.js';
import { PortfoliosService } from './portfolios.service.js';
import { PositionsService } from './positions.service.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('PortfoliosService', () => {
  const portfoliosRepository = vi.mocked({
    create: vi.fn(),
    findByOwnerId: vi.fn(),
    findAll: vi.fn(),
    findOne: vi.fn(),
    deleteOne: vi.fn(),
    updateCash: vi.fn(),
    getContributions: vi.fn(),
    getContributionsMetadata: vi.fn(),
    addContribution: vi.fn(),
    deleteContribution: vi.fn(),
  } as unknown as PortfoliosRepository);

  const portfolioStatesService = vi.mocked({
    getLastByPortfolioUuid: vi.fn(),
    deleteByPortfolioUuid: vi.fn(),
    getAverageBalancesForRange: vi.fn(),
    getPortfolioStatesInPeriod: vi.fn(),
  } as unknown as PortfolioStatesService);

  const positionsService = vi.mocked({
    getPositionDetailsByPortfolioUuid: vi.fn(),
    deleteByPortfolioUuid: vi.fn(),
    updatePortfolioState: vi.fn(),
  } as unknown as PositionsService);

  const indicesService = vi.mocked({
    findAll: vi.fn(),
    getIndexPerformanceForTimestamps: vi.fn(),
  } as unknown as IndicesService);

  const adminUser = <User>{
    id: faker.string.uuid(),
    email: faker.internet.email(),
    role: UserRole.ADMIN,
  };

  const adminUserPortfolio = portfolioFactory(
    faker.string.uuid(),
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
        expect.objectContaining({
          name: dto.name,
          ownerId: adminUser.id,
          positions: [],
          state: null,
        }),
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
      portfoliosRepository.findOne.mockResolvedValueOnce(null);

      await expect(
        service.findOne(adminUser, faker.string.uuid()),
      ).rejects.toThrow('Portfolio not found');
    });

    it("should fail if the user doesn't owns the portfolio", async () => {
      portfoliosRepository.findOne.mockResolvedValueOnce({
        ...adminUserPortfolio,
        ownerId: faker.string.uuid(),
      });

      await expect(
        service.findOne(adminUser, faker.string.uuid()),
      ).rejects.toThrow('Access denied');
    });

    it('should call repository for retrieving one portfolio with its positions', async () => {
      const positions = [
        positionDetailDtoFactory(),
        positionDetailDtoFactory(),
      ];
      const state = portfolioStateFactory();
      portfoliosRepository.findOne.mockResolvedValueOnce(adminUserPortfolio);
      positionsService.getPositionDetailsByPortfolioUuid.mockResolvedValueOnce(
        positions,
      );
      portfolioStatesService.getLastByPortfolioUuid.mockResolvedValueOnce(
        state,
      );

      const retrieved = await service.findOne(
        adminUser,
        adminUserPortfolio.uuid,
      );

      expect(retrieved).toEqual(<PortfolioDetailDto>{
        uuid: adminUserPortfolio.uuid,
        name: adminUserPortfolio.name,
        cash: adminUserPortfolio.cash,
        created: adminUserPortfolio.created,
        positions,
        state,
      });
    });

    it("should fail if the portfolio don't exist when getting metrics from repository", async () => {
      portfoliosRepository.findOne.mockResolvedValueOnce(null);

      await expect(
        service.getAverageBalances(
          adminUser,
          faker.string.uuid(),
          faker.word.sample(),
        ),
      ).rejects.toThrow('Portfolio not found');
    });

    it('should call repository to get portfolio metrics, sum contributions, and sort result', async () => {
      const portfolioAverageBalances = [
        portfolioAverageBalanceFactory(new Date(2022, 0, 2), 200),
        portfolioAverageBalanceFactory(new Date(2022, 0, 1), 100),
        portfolioAverageBalanceFactory(new Date(2022, 0, 5), 300),
        portfolioAverageBalanceFactory(new Date(2022, 0, 6), 200),
        portfolioAverageBalanceFactory(new Date(2022, 0, 8), 400),
      ];
      portfoliosRepository.findOne.mockResolvedValueOnce({
        ...adminUserPortfolio,
        contributions: [
          portfolioContributionFactory(
            faker.string.uuid(),
            new Date(2022, 0, 2),
            100,
          ),
          portfolioContributionFactory(
            faker.string.uuid(),
            new Date(2022, 0, 4),
            100,
          ),
          portfolioContributionFactory(
            faker.string.uuid(),
            new Date(2022, 0, 7),
            200,
          ),
        ],
      });
      portfolioStatesService.getAverageBalancesForRange.mockResolvedValueOnce(
        portfolioAverageBalances,
      );

      const metrics = await service.getAverageBalances(
        adminUser,
        faker.string.uuid(),
        faker.word.sample(),
      );

      const expected = [
        {
          ...portfolioAverageBalances[1],
          contributions: 0,
        },
        {
          ...portfolioAverageBalances[0],
          contributions: 100,
        },
        {
          ...portfolioAverageBalances[2],
          contributions: 200,
        },
        {
          ...portfolioAverageBalances[3],
          contributions: 200,
        },
        {
          ...portfolioAverageBalances[4],
          contributions: 400,
        },
      ];
      expect(metrics).toEqual(expected);
    });

    it('should call repository to get portfolio metrics', async () => {
      const portfolioAverageBalances = [
        portfolioAverageBalanceFactory(new Date(2022, 0, 1), 60),
        portfolioAverageBalanceFactory(new Date(2022, 0, 3), 90),
        portfolioAverageBalanceFactory(new Date(2022, 0, 4), 60),
        portfolioAverageBalanceFactory(new Date(2022, 0, 6), 90),
        portfolioAverageBalanceFactory(new Date(2022, 0, 5), 45),
        portfolioAverageBalanceFactory(new Date(2022, 0, 1), 120),
      ];
      portfoliosRepository.findOne.mockResolvedValueOnce(adminUserPortfolio);
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
        faker.string.uuid(),
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
      portfoliosRepository.findOne.mockResolvedValueOnce(null);

      await expect(
        service.getContributions(
          adminUser,
          faker.string.uuid(),
          faker.number.int(),
          faker.number.int(),
        ),
      ).rejects.toThrow('Portfolio not found');
    });

    it('should call repository to get portfolio contributions', async () => {
      const portfolioContributions = [
        portfolioContributionFactory(adminUserPortfolio.uuid),
        portfolioContributionFactory(adminUserPortfolio.uuid),
      ];
      portfoliosRepository.findOne.mockResolvedValueOnce(adminUserPortfolio);
      portfoliosRepository.getContributions.mockResolvedValueOnce(
        portfolioContributions,
      );

      const actual = await service.getContributions(
        adminUser,
        faker.string.uuid(),
        faker.number.int(),
        faker.number.int(),
      );

      expect(actual).toEqual(portfolioContributions);
    });

    it('should call repository to get portfolio contributions count', async () => {
      const count = faker.number.int();
      const sum = faker.number.int();
      const contributionsMetadata = new ContributionsMetadata(count, sum);
      portfoliosRepository.findOne.mockResolvedValueOnce(adminUserPortfolio);
      portfoliosRepository.getContributionsMetadata.mockResolvedValueOnce(
        contributionsMetadata,
      );

      const actual = await service.getContributionsMetadata(
        adminUser,
        faker.string.uuid(),
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
        totalValueEUR: value,
      }));

      indicesService.findAll.mockResolvedValueOnce([
        indexFactory(),
        indexFactory(),
        indexFactory(),
      ]);
      indicesService.getIndexPerformanceForTimestamps.mockResolvedValue([]);
      portfoliosRepository.findOne.mockResolvedValueOnce(portfolio);
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
        portfolio.uuid,
        TimePeriod.from(new Date(2022, 0, 1), new Date(2023, 0, 5)),
      );

      expect(actual).toEqual(expected);
    });
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
      totalValueEUR: value,
    }));
    const indices = [indexFactory(), indexFactory()];

    portfoliosRepository.findOne.mockResolvedValueOnce(portfolio);
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
      portfolio.uuid,
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
        amountEUR: 100,
      })),
    };

    const portfolioStates = [
      10000, 10085, 10287, 10339, 10600, 10600, 10600, 10600, 10600, 10600,
      10600, 10600,
    ].map((value, n) => ({
      ...portfolioStateFactory(),
      timestamp: new Date(2022, n, 1),
      totalValueEUR: value,
    }));

    indicesService.findAll.mockResolvedValueOnce([indexFactory()]);
    portfoliosRepository.findOne.mockResolvedValueOnce(portfolio);
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
      portfolio.uuid,
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
        amountEUR: 100,
      })),
    };

    const portfolioStates = [
      10000, 9000, 8000, 9000, 11000, 10000, 10000, 10000, 10000, 10000, 11000,
      11000,
    ].map((value, n) => ({
      ...portfolioStateFactory(),
      timestamp: new Date(2022, n, 2),
      totalValueEUR: value,
    }));

    indicesService.findAll.mockResolvedValueOnce([indexFactory()]);
    portfoliosRepository.findOne.mockResolvedValueOnce(portfolio);
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
      portfolio.uuid,
      TimePeriod.from(new Date(2022, 0, 1), new Date(2023, 0, 5)),
    );

    expect(actual).toEqual(expected);
  });

  describe('update', () => {
    it('should fail if the portfolio does not exist when updating cash', async () => {
      const dto = updatePortfolioCashDtoFactory();
      portfoliosRepository.findOne.mockResolvedValueOnce(null);

      await expect(
        service.updateCash(adminUser, faker.string.uuid(), dto),
      ).rejects.toThrow('Portfolio not found');
    });

    it('should call repo to update cash', async () => {
      const uuid = faker.string.uuid();
      const dto = updatePortfolioCashDtoFactory();
      portfoliosRepository.findOne.mockResolvedValueOnce(adminUserPortfolio);

      const actual = await service.updateCash(adminUser, uuid, dto);

      expect(actual).toEqual({ ...adminUserPortfolio, cash: dto.cash });
      expect(portfoliosRepository.updateCash).toHaveBeenCalledWith(
        uuid,
        dto.cash,
      );
      expect(positionsService.updatePortfolioState).toBeCalledWith({
        ...adminUserPortfolio,
        cash: dto.cash,
      });
    });

    it('should fail if the portfolio does not exist when adding a contribution', async () => {
      const dto = addPortfolioContributionDtoFactory();
      portfoliosRepository.findOne.mockResolvedValueOnce(null);

      await expect(
        service.addContribution(adminUser, faker.string.uuid(), dto),
      ).rejects.toThrow('Portfolio not found');
    });

    it('should call repo to add a contribution', async () => {
      const uuid = faker.string.uuid();
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
      portfoliosRepository.findOne.mockResolvedValueOnce(adminUserPortfolio);
      portfoliosRepository.findOne.mockResolvedValueOnce(expected);

      const actual = await service.addContribution(adminUser, uuid, dto);

      expect(actual).toEqual(expected);
      expect(portfoliosRepository.addContribution).toHaveBeenCalledWith(uuid, {
        uuid: expect.any(String),
        timestamp: dto.timestamp,
        amountEUR: dto.amountEUR,
      });
      expect(positionsService.updatePortfolioState).toBeCalledWith(expected);
    });

    it('should call repo to delete a contribution', async () => {
      const portfolioUuid = faker.string.uuid();
      const contributionUuid = faker.string.uuid();
      const expected = { ...adminUserPortfolio, contributions: [] };
      portfoliosRepository.findOne.mockResolvedValueOnce(adminUserPortfolio);
      portfoliosRepository.findOne.mockResolvedValueOnce(expected);

      const actual = await service.deleteContribution(
        adminUser,
        portfolioUuid,
        contributionUuid,
      );

      expect(actual).toEqual(expected);
      expect(portfoliosRepository.deleteContribution).toHaveBeenCalledWith(
        portfolioUuid,
        contributionUuid,
      );
      expect(positionsService.updatePortfolioState).toBeCalledWith(expected);
    });
  });

  describe('deletion', () => {
    it("should fail if the portfolio don't exist", async () => {
      portfoliosRepository.findOne.mockResolvedValueOnce(null);

      await expect(
        service.deleteOne(adminUser, faker.string.uuid()),
      ).rejects.toThrow('Portfolio not found');
    });

    it('should delete the portfolio and its positions and states', async () => {
      portfoliosRepository.findOne.mockResolvedValueOnce(adminUserPortfolio);

      await service.deleteOne(adminUser, adminUserPortfolio.uuid);

      expect(positionsService.deleteByPortfolioUuid).toHaveBeenCalledTimes(1);
      expect(
        portfolioStatesService.deleteByPortfolioUuid,
      ).toHaveBeenCalledTimes(1);
    });
  });
});
