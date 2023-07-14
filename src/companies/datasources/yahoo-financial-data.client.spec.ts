import { faker } from '@faker-js/faker';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { DataPoint } from '../../common/domain/entities/data-point.entity';
import { ChartBuilder } from '../__tests__/chart.factory';
import { YahooFinancialDataClient } from './yahoo-financial-data.client';

describe('YahooFinancialDataClient', () => {
  const mockedConfigService = jest.mocked({
    get: jest.fn(),
  } as unknown as ConfigService);

  const mockedHttpService = jest.mocked(
    { axiosRef: { get: jest.fn() } } as unknown as HttpService,
    true,
  );

  const client = new YahooFinancialDataClient(
    mockedConfigService,
    mockedHttpService,
  );

  beforeEach(() => jest.resetAllMocks());

  describe('definition', () => {
    it('should be defined', () => {
      expect(client).toBeDefined();
    });
  });

  describe('retrieving chart', () => {
    it('should map Chart to DataPoint[]', async () => {
      const chart = new ChartBuilder().build();
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
        expect(dataPoint.value).toEqual(
          chart.indicators.quote.at(0).close.at(n),
        );
      });
    });
  });
});
