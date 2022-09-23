import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PositionDocument, PositionModel } from './schemas/position.schema';

@Injectable()
export class PositionsRepository {
  constructor(
    @InjectModel(PositionModel.name)
    private positionModel: Model<PositionDocument>,
  ) {}

  deleteByPortfolioUuid(portfolioUuid: string) {
    return this.positionModel.deleteMany({ portfolioUuid });
  }
}
