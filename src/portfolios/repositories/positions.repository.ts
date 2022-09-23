import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { Model } from 'mongoose';
import { Position } from '../domain/entities/position.entity';
import { PositionDocument, PositionModel } from './schemas/position.schema';

@Injectable()
export class PositionsRepository {
  constructor(
    @InjectModel(PositionModel.name)
    private positionModel: Model<PositionDocument>,
  ) {}

  async create(position: Position): Promise<Position> {
    try {
      const created = (await this.positionModel.create(position)).toObject();
      return plainToInstance(Position, created);
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  deleteByPortfolioUuid(portfolioUuid: string) {
    return this.positionModel.deleteMany({ portfolioUuid });
  }
}
