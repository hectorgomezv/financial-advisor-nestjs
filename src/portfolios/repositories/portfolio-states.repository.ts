import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { Model } from 'mongoose';
import { PortfolioState } from '../domain/entities/portfolio-state.entity';
import {
  PortfolioStateDocument,
  PortfolioStateModel,
} from './schemas/portfolio-state.schema';

@Injectable()
export class PortfolioStatesRepository {
  constructor(
    @InjectModel(PortfolioStateModel.name)
    private collection: Model<PortfolioStateDocument>,
  ) {}

  getLastByPortfolioUuid(portfolioUuid: string) {
    return this.collection
      .findOne({ portfolioUuid })
      .sort({ timestamp: -1 })
      .limit(1);
  }

  async create(portfolioState: PortfolioState): Promise<PortfolioState> {
    const created = (await this.collection.create(portfolioState)).toObject();
    return plainToInstance(PortfolioState, created);
  }

  deleteByPortfolioUuid(portfolioUuid: string) {
    return this.collection.deleteMany({ portfolioUuid });
  }

  async getSeriesForRange(portfolioUuid: string, range: string) {
    const startTime = getRangeStartTimestamp();
    const grouping = getGroupingForRange();

    const aggr = this.collection
      .aggregate()
      .match({
        portfolioUuid,
        timestamp: { $gte: startTime },
      })
      .addFields({ parsedDate: { $toDate: '$timestamp' } })
      .group({
        _id: grouping,
        average: { $avg: '$totalValueEUR' },
      })
      .sort({ '_id.year': 1, '_id.day': 1, '_id.hour': 1 });

    const res = await aggr.exec();

    return res;
  }
}
function getRangeStartTimestamp() {
  return Date.now() - 365 * 24 * 60 * 60 * 1000;
}
function getGroupingForRange() {
  return {
    year: { $year: '$parsedDate' },
    week: { $week: '$parsedDate' },
  };
}
