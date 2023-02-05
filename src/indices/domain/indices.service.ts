import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
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
    const performanceItems: IndexPerformance[] =
      await this.repository.getIndexPerformanceFrom(
        index.uuid,
        initialTimestamp,
      );

    // For each timestamp, get the previous and next timestamps into result.
    // Calculate the average of the values of these previous and next items.
    // Return this average mapped to the passed timestamp value.
    const result = timestamps.map((ts) => {
      const previousIndex = performanceItems.findIndex(
        (i) => i.timestamp >= ts,
      );
      const previous = performanceItems[previousIndex];
      const next = performanceItems[previousIndex + 1];
      return {
        timestamp: ts,
        value: (previous.value + next.value) / 2,
      };
    });

    return result;
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
