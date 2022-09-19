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

  findAll() {
    return this.portfolioModel.find().exec();
  }

  findOne(uuid: string) {
    return this.portfolioModel.findOne({ uuid }).exec();
  }

  deleteOne(uuid: string) {
    return this.portfolioModel.deleteOne({ uuid });
  }
}
