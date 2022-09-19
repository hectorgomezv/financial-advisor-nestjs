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
    private portfolioStateModel: Model<PortfolioStateDocument>,
  ) {}

  async create(portfolioState: PortfolioState): Promise<PortfolioState> {
    const created = (
      await this.portfolioStateModel.create(portfolioState)
    ).toObject();
    return plainToInstance(PortfolioState, created);
  }

  async getSeriesForRange(uuid, range) {
    return [1, 2, 3];
  }
}
