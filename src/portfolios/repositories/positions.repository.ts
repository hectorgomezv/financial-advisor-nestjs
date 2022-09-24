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
    private model: Model<PositionDocument>,
  ) {}

  async create(position: Position): Promise<Position> {
    const created = (await this.model.create(position)).toObject();
    return plainToInstance(Position, created);
  }

  async findByUuid(uuid: string): Promise<Position> {
    const position = (await this.model.findOne({ uuid })).toObject();
    return plainToInstance(Position, position);
  }

  findByCompanyUuidAndPortfolioUuid(
    companyUuid: string,
    portfolioUuid: string,
  ) {
    return this.model.findOne({ companyUuid, portfolioUuid });
  }

  findByPortfolioUuid(portfolioUuid: string) {
    return this.model.find({ portfolioUuid });
  }

  deleteByPortfolioUuid(portfolioUuid: string) {
    return this.model.deleteMany({ portfolioUuid });
  }

  deleteByUuidAndPortfolioUuid(portfolioUuid: string, uuid: string) {
    return this.model.deleteOne({ portfolioUuid, uuid });
  }

  update(uuid: string, patch: Partial<Position>) {
    return this.model.updateOne({ uuid }, patch);
  }
}
