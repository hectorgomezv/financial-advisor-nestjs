import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { Model } from 'mongoose';
import { PortfolioAverageMetric } from '../domain/entities/portfolio-average-metric.entity';
import { PortfolioState } from '../domain/entities/portfolio-state.entity';
import { TimeRange } from '../domain/entities/time-range.enum';
import {
  PortfolioStateDocument,
  PortfolioStateModel,
} from './schemas/portfolio-state.schema';

@Injectable()
export class PortfolioStatesRepository {
  constructor(
    @InjectModel(PortfolioStateModel.name)
    private model: Model<PortfolioStateDocument>,
  ) {}

  async getLastByPortfolioUuid(portfolioUuid: string): Promise<PortfolioState> {
    const result = await this.model
      .findOne({ portfolioUuid })
      .sort({ timestamp: -1 })
      .limit(1)
      .lean();

    return plainToInstance(PortfolioState, result, {
      excludePrefixes: ['_', '__'],
    });
  }

  async create(portfolioState: PortfolioState): Promise<PortfolioState> {
    const created = (await this.model.create(portfolioState)).toObject();
    return plainToInstance(PortfolioState, created, {
      excludePrefixes: ['_', '__'],
    });
  }

  async deleteByPortfolioUuid(portfolioUuid: string): Promise<void> {
    await this.model.deleteMany({ portfolioUuid });
  }

  async getSeriesForRange(
    portfolioUuid: string,
    range: TimeRange,
  ): Promise<PortfolioAverageMetric[]> {
    const result = await this.model
      .aggregate()
      .match({
        portfolioUuid,
        timestamp: { $gte: this.getRangeStartTimestamp(range) },
      })
      .addFields({ parsedDate: { $toDate: '$timestamp' } })
      .group({
        _id: this.getGroupingForRange(range),
        average: { $avg: '$totalValueEUR' },
      })
      .sort({ '_id.year': 1, '_id.day': 1, '_id.hour': 1 })
      .exec();

    return result.map((i) => this.mapToPortfolioAverageMetric(i, range));
  }

  private getRangeStartTimestamp(range: TimeRange) {
    const oneDayInMs = 24 * 60 * 60 * 1000;

    switch (range) {
      case TimeRange.Year:
        return Date.now() - 365 * oneDayInMs;
      case TimeRange.Month:
        return Date.now() - 30 * oneDayInMs;
      case TimeRange.Week:
        return Date.now() - 7 * oneDayInMs;
    }
  }

  private getGroupingForRange(range: TimeRange) {
    switch (range) {
      case TimeRange.Year:
        return {
          year: { $year: '$parsedDate' },
          week: { $week: '$parsedDate' },
        };
      case TimeRange.Month:
        return {
          year: { $year: '$parsedDate' },
          day: { $dayOfYear: '$parsedDate' },
        };
      case TimeRange.Week:
        return {
          year: { $year: '$parsedDate' },
          day: { $dayOfYear: '$parsedDate' },
          hour: { $hour: '$parsedDate' },
        };
    }
  }

  private mapToPortfolioAverageMetric(
    item: any,
    range: TimeRange,
  ): PortfolioAverageMetric {
    const { _id, average } = item;

    switch (range) {
      case TimeRange.Year:
        return {
          timestamp: new Date(_id.year, 0, 1 + (_id.week - 1) * 7, 0).getTime(),
          average,
        };
      case TimeRange.Month:
      case TimeRange.Week:
        return {
          timestamp: new Date(_id.year, 0, _id.day, _id.hour || 0).getTime(),
          average,
        };
    }
  }
}
