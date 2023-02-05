import { faker } from '@faker-js/faker';
import { random, range } from 'lodash';
import { AuthService } from '../../common/auth/auth-service';
import { User, UserRole } from '../../common/auth/entities/user.entity';
import { dataPointFactory } from '../../common/domain/entities/__tests__/data-point.factory';
import { IFinancialDataClient } from '../../companies/datasources/financial-data.client.interface';
import { IndicesRepository } from '../repositories/indices.repository';
import { indexPerformanceFactory } from './entities/__tests__/index-performance.factory';
import { indexFactory } from './entities/__tests__/index.factory';
import { IndicesService } from './indices.service';

describe('IndicesService', () => {
  const mockedIndicesRepository = jest.mocked({
    findAll: jest.fn(),
    getIndexPerformanceFrom: jest.fn(),
  } as unknown as IndicesRepository);

  const mockedAuthService = jest.mocked({
    checkAdmin: jest.fn(),
  } as unknown as AuthService);

  const mockedFinancialDataClient = jest.mocked(
    {} as unknown as IFinancialDataClient,
  );

  const service = new IndicesService(
    mockedIndicesRepository,
    mockedAuthService,
    mockedFinancialDataClient,
  );

  // TODO: userFactory
  const user = <User>{
    id: faker.datatype.uuid(),
    email: faker.internet.email(),
    role: UserRole.ADMIN,
  };

  beforeEach(() => jest.resetAllMocks());

  describe('retrieving indices', () => {
    it('should return repository indices', async () => {
      const indices = range(random(2, 5)).map(() => indexFactory());
      mockedIndicesRepository.findAll.mockResolvedValueOnce(indices);

      const actual = await service.findAll(user);

      expect(actual).toEqual(indices);
    });
  });

  describe('retrieving indices performance for timestamps', () => {
    it('should return indices performance metrics', async () => {
      const dataPoints = [
        dataPointFactory(11, 100),
        dataPointFactory(29, 110),
        dataPointFactory(21, 130),
        dataPointFactory(32, 85),
        dataPointFactory(39, 150),
      ];
      const index = indexFactory(null, null, null, dataPoints);
      mockedIndicesRepository.getIndexPerformanceFrom.mockResolvedValueOnce(
        dataPoints,
      );

      const actual = await service.getIndexPerformanceForTimestamps(
        index,
        dataPoints[0].timestamp,
        [0, 5, 10, 15, 20, 25, 30, 35, 40, 45],
      );

      const expected = [
        indexPerformanceFactory(0, 0),
        indexPerformanceFactory(5, 0),
        indexPerformanceFactory(10, 0),
        indexPerformanceFactory(15, 15),
        indexPerformanceFactory(20, 15),
        indexPerformanceFactory(25, 20),
        indexPerformanceFactory(30, -2.5),
        indexPerformanceFactory(35, 17.5),
        indexPerformanceFactory(40, 50),
        indexPerformanceFactory(45, 50),
      ];

      expect(actual).toEqual(expected);
    });
  });
});
