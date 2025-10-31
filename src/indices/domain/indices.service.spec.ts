import _ from 'lodash';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '../../common/auth/auth-service.js';
import { userFactory } from '../../common/auth/entities/__tests__/user.factory.js';
import { dataPointFactory } from '../../common/domain/entities/__tests__/data-point.factory.js';
import { IFinancialDataClient } from '../../companies/datasources/financial-data.client.interface.js';
import { IndicesRepository } from '../repositories/indices.repository.js';
import { indexFactory } from './entities/__tests__/index.factory.js';
import { IndicesService } from './indices.service.js';
const { random, range } = _;

describe('IndicesService', () => {
  const mockedIndicesRepository = vi.mocked({
    findAll: vi.fn(),
    getIndexValuesFrom: vi.fn(),
  } as unknown as IndicesRepository);

  const mockedAuthService = vi.mocked({
    checkAdmin: vi.fn(),
  } as unknown as AuthService);

  const mockedFinancialDataClient = vi.mocked(
    {} as unknown as IFinancialDataClient,
  );

  const service = new IndicesService(
    mockedIndicesRepository,
    mockedAuthService,
    mockedFinancialDataClient,
  );

  beforeEach(() => vi.resetAllMocks());

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
        dataPointFactory(new Date(2022, 0, 1, 1, 11), 100),
        dataPointFactory(new Date(2022, 0, 1, 1, 29), 110),
        dataPointFactory(new Date(2022, 0, 1, 1, 21), 130),
        dataPointFactory(new Date(2022, 0, 1, 1, 32), 85),
        dataPointFactory(new Date(2022, 0, 1, 1, 39), 150),
      ];
      const index = indexFactory(undefined, undefined, undefined, dataPoints);
      mockedIndicesRepository.getIndexValuesFrom.mockResolvedValueOnce(
        dataPoints,
      );

      const actual = await service.getIndexPerformanceForTimestamps(
        index,
        dataPoints[0].timestamp,
        [
          new Date(2022, 0, 1, 1, 0),
          new Date(2022, 0, 1, 1, 5),
          new Date(2022, 0, 1, 1, 10),
          new Date(2022, 0, 1, 1, 15),
          new Date(2022, 0, 1, 1, 20),
          new Date(2022, 0, 1, 1, 25),
          new Date(2022, 0, 1, 1, 30),
          new Date(2022, 0, 1, 1, 35),
          new Date(2022, 0, 1, 1, 40),
          new Date(2022, 0, 1, 1, 45),
        ],
      );

      const expected = [
        dataPointFactory(new Date(2022, 0, 1, 1, 0), 0),
        dataPointFactory(new Date(2022, 0, 1, 1, 5), 0),
        dataPointFactory(new Date(2022, 0, 1, 1, 10), 0),
        dataPointFactory(new Date(2022, 0, 1, 1, 15), 15),
        dataPointFactory(new Date(2022, 0, 1, 1, 20), 15),
        dataPointFactory(new Date(2022, 0, 1, 1, 25), 20),
        dataPointFactory(new Date(2022, 0, 1, 1, 30), -2.5),
        dataPointFactory(new Date(2022, 0, 1, 1, 35), 17.5),
        dataPointFactory(new Date(2022, 0, 1, 1, 40), 50),
        dataPointFactory(new Date(2022, 0, 1, 1, 45), 50),
      ];

      expect(actual).toEqual(expected);
    });
  });
});
