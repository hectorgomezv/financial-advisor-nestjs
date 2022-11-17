import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { Model } from 'mongoose';
import { Portfolio } from '../domain/entities/portfolio.entity';
import { PortfolioDocument, PortfolioModel } from './schemas/portfolio.schema';

@Injectable()
export class PortfoliosRepository {
  constructor(
    @InjectModel(PortfolioModel.name)
    public model: Model<PortfolioDocument>,
  ) {}

  async create(portfolio: Portfolio): Promise<Portfolio> {
    const created = (await this.model.create(portfolio)).toObject();
    return plainToInstance(Portfolio, created, {
      excludePrefixes: ['_', '__'],
    });
  }

  async findAll(): Promise<Portfolio[]> {
    const result = await this.model.find().lean();
    return plainToInstance(Portfolio, result, { excludePrefixes: ['_', '__'] });
  }

  async findOne(uuid: string): Promise<Portfolio> {
    const result = await this.model.findOne({ uuid }).lean();
    return plainToInstance(Portfolio, result, { excludePrefixes: ['_', '__'] });
  }

  async deleteOne(uuid: string): Promise<void> {
    await this.model.deleteOne({ uuid });
  }

  async updateCash(uuid: string, cash: number) {
    await this.model.updateOne({ uuid }, { $set: { cash } });
  }
}
