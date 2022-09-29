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
    private portfolioModel: Model<PortfolioDocument>,
  ) {}

  async create(portfolio: Portfolio): Promise<Portfolio> {
    const created = (await this.portfolioModel.create(portfolio)).toObject();
    return plainToInstance(Portfolio, created);
  }

  async findAll(): Promise<Portfolio[]> {
    const result = await this.portfolioModel.find().exec();
    return plainToInstance(
      Portfolio,
      result.map((i) => i.toObject()),
    );
  }

  async findOne(uuid: string): Promise<Portfolio> {
    const result = (await this.portfolioModel.findOne({ uuid })).toObject();
    return plainToInstance(Portfolio, result);
  }

  async deleteOne(uuid: string): Promise<void> {
    await this.portfolioModel.deleteOne({ uuid });
  }
}
