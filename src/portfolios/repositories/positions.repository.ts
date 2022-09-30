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
    const result = await this.model.findOne({ uuid }).limit(1).lean();
    return plainToInstance(Position, result);
  }

  async findByCompanyUuidAndPortfolioUuid(
    companyUuid: string,
    portfolioUuid: string,
  ): Promise<Position> {
    const result = await this.model
      .findOne({ companyUuid, portfolioUuid })
      .limit(1)
      .lean();

    return plainToInstance(Position, result);
  }

  async findByCompanyUuid(companyUuid: string): Promise<Position[]> {
    return plainToInstance(
      Position,
      await this.model.find({ companyUuid }).lean(),
    );
  }

  async findByPortfolioUuid(portfolioUuid: string): Promise<Position[]> {
    return plainToInstance(
      Position,
      await this.model.find({ portfolioUuid }).lean(),
    );
  }

  async deleteByPortfolioUuid(portfolioUuid: string): Promise<void> {
    await this.model.deleteMany({ portfolioUuid });
  }

  async deleteByUuidAndPortfolioUuid(
    portfolioUuid: string,
    uuid: string,
  ): Promise<void> {
    await this.model.deleteOne({ portfolioUuid, uuid });
  }

  async update(uuid: string, patch: Partial<Position>): Promise<void> {
    await this.model.updateOne({ uuid }, patch);
  }
}
