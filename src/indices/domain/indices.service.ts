import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { first, isEmpty, last, sortBy } from 'lodash';
import { AuthService } from '../../common/auth/auth-service';
import { User } from '../../common/auth/entities/user.entity';
import { IFinancialDataClient } from '../../companies/datasources/financial-data.client.interface';
import { IndicesRepository } from '../repositories/indices.repository';
import { IndexPerformance } from './entities/index-performance.entity';
import { Index } from './entities/index.entity';

@Injectable()
export class IndicesService {
  private readonly logger = new Logger(IndicesService.name);

  constructor(
    private readonly repository: IndicesRepository,
    private readonly authService: AuthService,
    @Inject(IFinancialDataClient)
    private readonly financialDataClient: IFinancialDataClient,
  ) {}

  findAll(user: User) {
    this.authService.checkAdmin(user);
    return this.repository.findAll();
  }

  async getIndexPerformanceForTimestamps(
    index: Index,
    initialTimestamp: number,
    timestamps: number[],
  ): Promise<IndexPerformance[]> {
    const performanceItems = sortBy(
      await this.repository.getIndexPerformanceFrom(
        index.uuid,
        initialTimestamp / 1000,
      ),
      'timestamp',
      // TODO: normalize timestamp units in yahoo client instead of here
    ).map((item) => ({ ...item, timestamp: item.timestamp * 1000 }));

    const averageValues = timestamps.map((ts) => {
      return {
        timestamp: ts,
        avgValue: this.getAvgPerformance(performanceItems, ts),
      };
    });
    const firstValue = first(averageValues).avgValue;

    return averageValues.map(({ timestamp, avgValue }, idx) => ({
      timestamp,
      value:
        idx === 0 || firstValue === 0 ? 0 : (avgValue * 100) / firstValue - 100,
    }));
  }

  private getAvgPerformance(
    items: IndexPerformance[],
    timestamp: number,
  ): number {
    if (isEmpty(items)) return 0;
    if (items[0].timestamp >= timestamp) return items[0].value;
    if (last(items).timestamp <= timestamp) return last(items).value;
    const nextIndex = items.findIndex((i) => i.timestamp >= timestamp);
    return (items[nextIndex - 1].value + items[nextIndex].value) / 2;
  }

  async reloadAll(user: User) {
    this.authService.checkAdmin(user);
    await this.refreshIndices();
    return this.repository.findAll();
  }

  @Cron('0 04 16 * * *', { timeZone: 'America/New_York' })
  private async refreshIndices() {
    const indices = await this.repository.findAll();
    await Promise.all(
      indices.map(async (index) => {
        const dataPoints = await this.financialDataClient.getChartDataPoints(
          index.symbol,
        );
        await this.repository.persistDataPoints(index.uuid, dataPoints);
      }),
    );
  }
}
