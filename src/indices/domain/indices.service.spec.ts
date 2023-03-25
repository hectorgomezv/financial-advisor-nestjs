import { random, range } from 'lodash';
import { AuthService } from '../../common/auth/auth-service';
import { userFactory } from '../../common/auth/entities/__tests__/user.factory';
import { dataPointFactory } from '../../common/domain/entities/__tests__/data-point.factory';
import { IFinancialDataClient } from '../../companies/datasources/financial-data.client.interface';
import { IndicesRepository } from '../repositories/indices.repository';
import { indexFactory } from './entities/__tests__/index.factory';
import { IndicesService } from './indices.service';

describe('IndicesService', () => {
  const mockedIndicesRepository = jest.mocked({
    findAll: jest.fn(),
    getIndexValuesFrom: jest.fn(),
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

  beforeEach(() => jest.resetAllMocks());

  describe('retrieving indices', () => {
    it('should return repository indices', async () => {
      const indices = range(random(2, 5)).map(() => indexFactory());
      mockedIndicesRepository.findAll.mockResolvedValueOnce(indices);

      const actual = await service.findAll(userFactory());

      expect(actual).toEqual(indices);
    });
  });

  describe('retrieving indices performance for timestamps', () => {
    it('should return indices performance metrics', async () => {
      const dataPoints = [
        dataPointFactory(new Date(2022, 0, 1, 0, 11), 100),
        dataPointFactory(new Date(2022, 0, 1, 0, 29), 110),
        dataPointFactory(new Date(2022, 0, 1, 0, 21), 130),
        dataPointFactory(new Date(2022, 0, 1, 0, 32), 85),
        dataPointFactory(new Date(2022, 0, 1, 0, 39), 150),
      ];
      const index = indexFactory(null, null, null, dataPoints);
      mockedIndicesRepository.getIndexValuesFrom.mockResolvedValueOnce(
        dataPoints,
      );

      const actual = await service.getIndexPerformanceForTimestamps(
        index,
        dataPoints[0].timestamp,
        [
          new Date(2022, 0, 1, 9, 0),
          new Date(2022, 0, 1, 9, 5),
          new Date(2022, 0, 1, 9, 10),
          new Date(2022, 0, 1, 9, 15),
          new Date(2022, 0, 1, 9, 20),
          new Date(2022, 0, 1, 9, 25),
          new Date(2022, 0, 1, 9, 30),
          new Date(2022, 0, 1, 9, 35),
          new Date(2022, 0, 1, 9, 40),
          new Date(2022, 0, 1, 9, 45),
        ],
      );

      const expected = [
        dataPointFactory(new Date(2022, 0, 1, 0), 0),
        dataPointFactory(new Date(2022, 0, 1, 5), 0),
        dataPointFactory(new Date(2022, 0, 1, 10), 0),
        dataPointFactory(new Date(2022, 0, 1, 15), 15),
        dataPointFactory(new Date(2022, 0, 1, 20), 15),
        dataPointFactory(new Date(2022, 0, 1, 25), 20),
        dataPointFactory(new Date(2022, 0, 1, 30), -2.5),
        dataPointFactory(new Date(2022, 0, 1, 35), 17.5),
        dataPointFactory(new Date(2022, 0, 1, 40), 50),
        dataPointFactory(new Date(2022, 0, 1, 45), 50),
      ];

      expect(actual).toEqual(expected);
    });
  });
});
