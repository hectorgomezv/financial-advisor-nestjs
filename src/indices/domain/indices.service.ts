import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { isAfter, isBefore, isEqual } from 'date-fns';
import { first, isEmpty, last, sortBy } from 'lodash';
import { AuthService } from '../../common/auth/auth-service.js';
import { User } from '../../common/auth/entities/user.entity.js';
import { DataPoint } from '../../common/domain/entities/data-point.entity.js';
import { IFinancialDataClient } from '../../companies/datasources/financial-data.client.interface.js';
import { IndicesRepository } from '../repositories/indices.repository.js';
import { Index } from './entities/index.entity.js';

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
    initialTimestamp: Date,
    timestamps: Date[],
  ): Promise<DataPoint[]> {
    const indexValues = sortBy(
      await this.repository.getIndexValuesFrom(index.uuid, initialTimestamp),
      'timestamp',
    );

    const averageValues = timestamps.map((ts) => {
      return {
        timestamp: ts,
        avgValue: this.getAvgValue(indexValues, ts),
      };
    });
    const firstValue = first(averageValues)?.avgValue;

    return averageValues.map(({ timestamp, avgValue }, n) => ({
      timestamp,
      value: n === 0 || !firstValue ? 0 : (avgValue * 100) / firstValue - 100,
    }));
  }

  private getAvgValue(dataPoints: DataPoint[], timestamp: Date): number {
    if (isEmpty(dataPoints)) return 0;
    if (
      isAfter(dataPoints[0].timestamp, timestamp) ||
      isEqual(dataPoints[0].timestamp, timestamp)
    )
      return dataPoints[0].value;
    if (
      isBefore(last(dataPoints)!.timestamp, timestamp) ||
      isEqual(last(dataPoints)!.timestamp, timestamp)
    )
      return last(dataPoints)!.value;

    const nextIndex = dataPoints.findIndex((i) => i.timestamp >= timestamp);
    return (dataPoints[nextIndex - 1].value + dataPoints[nextIndex].value) / 2;
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
