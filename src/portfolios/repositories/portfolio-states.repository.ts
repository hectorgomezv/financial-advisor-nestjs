import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { Model } from 'mongoose';
import { TimePeriod } from '../../common/domain/entities/time-period.entity';
import { PortfolioAverageBalance } from '../domain/entities/portfolio-average-balance.entity';
import { PortfolioState } from '../domain/entities/portfolio-state.entity';
import {
  getRangeStartTimestamp,
  TimeRange,
} from '../domain/entities/time-range.enum';
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

  async getAverageBalancesForRange(
    portfolioUuid: string,
    range: TimeRange,
  ): Promise<Partial<PortfolioAverageBalance>[]> {
    const result = await this.model
      .aggregate()
      .match({
        portfolioUuid,
        timestamp: { $gte: getRangeStartTimestamp(range) },
      })
      .addFields({ parsedDate: { $toDate: '$timestamp' } })
      .group({
        _id: this.getGroupingForRange(range),
        average: { $avg: '$totalValueEUR' },
      })
      .sort({ '_id.year': 1, '_id.day': 1, '_id.hour': 1 })
      .exec();

    return result.map((i) => this.mapToPortfolioAverageBalance(i, range));
  }

  async getPortfolioStatesInPeriod(
    portfolioUuid: string,
    period: TimePeriod,
  ): Promise<Partial<PortfolioState>[]> {
    const result = await this.model
      .find({
        portfolioUuid,
        timestamp: { $gte: new Date(period.start), $lt: new Date(period.end) },
      })
      .sort({ timestamp: 1 })
      .lean();

    return plainToInstance(PortfolioState, result, {
      excludePrefixes: ['_', '__'],
    });
  }

  private getGroupingForRange(range: TimeRange) {
    switch (range) {
      case TimeRange.TwoYears:
      case TimeRange.ThreeYears:
      case TimeRange.FiveYears:
        return {
          year: { $year: '$parsedDate' },
          week: { $week: '$parsedDate' },
        };
      case TimeRange.Month:
      case TimeRange.TwoMonths:
      case TimeRange.ThreeMonths:
      case TimeRange.SixMonths:
      case TimeRange.Year:
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

  private mapToPortfolioAverageBalance(
    item: any,
    range: TimeRange,
  ): Partial<PortfolioAverageBalance> {
    const { _id, average } = item;

    switch (range) {
      case TimeRange.TwoYears:
      case TimeRange.ThreeYears:
      case TimeRange.FiveYears:
        return {
          timestamp: new Date(_id.year, 0, 1 + (_id.week - 1) * 7, 0),
          average,
        };
      case TimeRange.Week:
      case TimeRange.Month:
      case TimeRange.TwoMonths:
      case TimeRange.ThreeMonths:
      case TimeRange.SixMonths:
      case TimeRange.Year:
        return {
          timestamp: new Date(_id.year, 0, _id.day, _id.hour ?? 0),
          average,
        };
    }
  }
}
