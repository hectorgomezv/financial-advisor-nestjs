import { faker } from '@faker-js/faker';
import { random, range } from 'lodash';
import { AuthService } from '../../common/auth/auth-service';
import { User, UserRole } from '../../common/auth/entities/user.entity';
import { dataPointFactory } from '../../common/domain/entities/__tests__/data-point.factory';
import { indexFactory } from '../../indices/domain/entities/__tests__/index.factory';
import { IndicesService } from '../../indices/domain/indices.service';
import { PortfoliosRepository } from '../repositories/portfolios.repository';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { PortfolioDetailDto } from './dto/portfolio-detail.dto';
import { addPortfolioContributionDtoFactory } from './dto/test/add-portfolio-contribution.dto.factory';
import { positionDetailDtoFactory } from './dto/test/position-detail-dto.factory';
import { updatePortfolioCashDtoFactory } from './dto/test/update-portfolio-cash.dto.factory';
import { ContributionsMetadata } from './entities/contributions-metadata';
import { portfolioFactory } from './entities/__tests__/porfolio.factory';
import { portfolioAverageBalanceFactory } from './entities/__tests__/portfolio-average-metric.factory';
import { portfolioContributionFactory } from './entities/__tests__/portfolio-contribution.factory';
import { portfolioStateFactory } from './entities/__tests__/portfolio-state.factory';
import { PortfolioStatesService } from './portfolio-states.service';
import { PortfoliosService } from './portfolios.service';
import { PositionsService } from './positions.service';

describe('PortfoliosService', () => {
  const portfoliosRepository = jest.mocked({
    create: jest.fn(),
    findByOwnerId: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    deleteOne: jest.fn(),
    updateCash: jest.fn(),
    getContributions: jest.fn(),
    getContributionsMetadata: jest.fn(),
    addContribution: jest.fn(),
    deleteContribution: jest.fn(),
  } as unknown as PortfoliosRepository);

  const portfolioStatesService = jest.mocked({
    getLastByPortfolioUuid: jest.fn(),
    deleteByPortfolioUuid: jest.fn(),
    getAverageBalancesForRange: jest.fn(),
  } as unknown as PortfolioStatesService);

  const positionsService = jest.mocked({
    getPositionDetailsByPortfolioUuid: jest.fn(),
    deleteByPortfolioUuid: jest.fn(),
    updatePortfolioState: jest.fn(),
  } as unknown as PositionsService);

  const indicesService = jest.mocked({
    findAll: jest.fn(),
    getIndexPerformanceForTimestamps: jest.fn(),
  } as unknown as IndicesService);

  const adminUser = <User>{
    id: faker.datatype.uuid(),
    email: faker.internet.email(),
    role: UserRole.ADMIN,
  };

  const adminUserPortfolio = portfolioFactory(
    faker.datatype.uuid(),
    faker.random.word(),
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
        name: faker.random.words(),
        seed: Number(faker.finance.amount()),
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
        service.findOne(adminUser, faker.datatype.uuid()),
      ).rejects.toThrow('Portfolio not found');
    });

    it("should fail if the user doesn't owns the portfolio", async () => {
      portfoliosRepository.findOne.mockResolvedValueOnce({
        ...adminUserPortfolio,
        ownerId: faker.datatype.uuid(),
      });

      await expect(
        service.findOne(adminUser, faker.datatype.uuid()),
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
        seed: adminUserPortfolio.seed,
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
          faker.datatype.uuid(),
          faker.random.word(),
        ),
      ).rejects.toThrow('Portfolio not found');
    });

    it('should call repository to get portfolio metrics, sum contributions, and sort result', async () => {
      const portfolioAverageBalances = [
        portfolioAverageBalanceFactory(2, 200),
        portfolioAverageBalanceFactory(1, 100),
        portfolioAverageBalanceFactory(5, 300),
        portfolioAverageBalanceFactory(6, 200),
        portfolioAverageBalanceFactory(8, 400),
      ];
      portfoliosRepository.findOne.mockResolvedValueOnce({
        ...adminUserPortfolio,
        contributions: [
          portfolioContributionFactory(faker.datatype.uuid(), 2, 100),
          portfolioContributionFactory(faker.datatype.uuid(), 4, 100),
          portfolioContributionFactory(faker.datatype.uuid(), 7, 200),
        ],
      });
      portfolioStatesService.getAverageBalancesForRange.mockResolvedValueOnce(
        portfolioAverageBalances,
      );

      const metrics = await service.getAverageBalances(
        adminUser,
        faker.datatype.uuid(),
        faker.random.word(),
      );

      const expected = [
        {
          ...portfolioAverageBalances[1],
          contributions: adminUserPortfolio.seed,
        },
        {
          ...portfolioAverageBalances[0],
          contributions: adminUserPortfolio.seed + 100,
        },
        {
          ...portfolioAverageBalances[2],
          contributions: adminUserPortfolio.seed + 200,
        },
        {
          ...portfolioAverageBalances[3],
          contributions: adminUserPortfolio.seed + 200,
        },
        {
          ...portfolioAverageBalances[4],
          contributions: adminUserPortfolio.seed + 400,
        },
      ];
      expect(metrics).toEqual(expected);
    });

    it('should call repository to get portfolio metrics', async () => {
      const portfolioAverageBalances = [
        portfolioAverageBalanceFactory(1, 60),
        portfolioAverageBalanceFactory(3, 90),
        portfolioAverageBalanceFactory(4, 60),
        portfolioAverageBalanceFactory(6, 90),
        portfolioAverageBalanceFactory(5, 45),
        portfolioAverageBalanceFactory(2, 120),
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
        faker.datatype.uuid(),
        faker.random.word(),
      );

      const expected = [
        expect.objectContaining(dataPointFactory(1, 0)),
        expect.objectContaining(dataPointFactory(2, 100)),
        expect.objectContaining(dataPointFactory(3, 50)),
        expect.objectContaining(dataPointFactory(4, 0)),
        expect.objectContaining(dataPointFactory(5, -25)),
        expect.objectContaining(dataPointFactory(6, 50)),
      ];

      expect(performance).toEqual(expected);
    });

    it("should fail if the portfolio don't exist when getting contributions from repository", async () => {
      portfoliosRepository.findOne.mockResolvedValueOnce(null);

      await expect(
        service.getContributions(
          adminUser,
          faker.datatype.uuid(),
          faker.datatype.number(),
          faker.datatype.number(),
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
        faker.datatype.uuid(),
        faker.datatype.number(),
        faker.datatype.number(),
      );

      expect(actual).toEqual(portfolioContributions);
    });

    it('should call repository to get portfolio contributions count', async () => {
      const count = faker.datatype.number();
      const sum = faker.datatype.number();
      const contributionsMetadata = new ContributionsMetadata(count, sum);
      portfoliosRepository.findOne.mockResolvedValueOnce(adminUserPortfolio);
      portfoliosRepository.getContributionsMetadata.mockResolvedValueOnce(
        contributionsMetadata,
      );

      const actual = await service.getContributionsMetadata(
        adminUser,
        faker.datatype.uuid(),
      );

      expect(actual).toEqual(contributionsMetadata);
    });
  });

  describe('update', () => {
    it('should fail if the portfolio does not exist when updating cash', async () => {
      const dto = updatePortfolioCashDtoFactory();
      portfoliosRepository.findOne.mockResolvedValueOnce(null);

      await expect(
        service.updateCash(adminUser, faker.datatype.uuid(), dto),
      ).rejects.toThrow('Portfolio not found');
    });

    it('should call repo to update cash', async () => {
      const uuid = faker.datatype.uuid();
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
        service.addContribution(adminUser, faker.datatype.uuid(), dto),
      ).rejects.toThrow('Portfolio not found');
    });

    it('should call repo to add a contribution', async () => {
      const uuid = faker.datatype.uuid();
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
      const portfolioUuid = faker.datatype.uuid();
      const contributionUuid = faker.datatype.uuid();
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
        service.deleteOne(adminUser, faker.datatype.uuid()),
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
