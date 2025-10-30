import { beforeEach, describe, expect, it, vi } from 'vitest';
import { faker } from '@faker-js/faker';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { DataPoint } from '../../common/domain/entities/data-point.entity.js';
import { ChartBuilder } from '../__tests__/chart.factory.js';
import { YahooFinancialDataClient } from './yahoo-financial-data.client.js';

describe('YahooFinancialDataClient', () => {
  const mockedConfigService = vi.mocked({
    get: vi.fn(),
    getOrThrow: vi.fn(),
  } as unknown as ConfigService);

  const mockedHttpService = vi.mocked({
    axiosRef: { get: vi.fn() },
  } as unknown as HttpService);

  const client = new YahooFinancialDataClient(
    mockedConfigService,
    mockedHttpService,
  );

  beforeEach(() => vi.resetAllMocks());

  describe('definition', () => {
    it('should be defined', () => {
      expect(client).toBeDefined();
    });
  });

  describe('retrieving chart', () => {
    it('should map Chart to DataPoint[]', async () => {
      const chart = new ChartBuilder().build();
      // @ts-expect-error todo: fix mock type
      mockedHttpService.axiosRef.get.mockResolvedValue({
        data: { chart: { result: [chart] } },
      });
      const res: DataPoint[] = await client.getChartDataPoints(
        faker.word.sample(),
      );
      res.forEach((dataPoint, n) => {
        expect(dataPoint.timestamp).toEqual(
          new Date(chart.timestamp[n] * 1000),
        );
        expect(dataPoint.value).toEqual(chart.indicators.quote[0].close[n]);
      });
    });
  });
});
