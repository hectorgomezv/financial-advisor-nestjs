import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { Model } from 'mongoose';
import { ContributionsMetadata } from '../domain/entities/contributions-metadata';
import { PortfolioContribution } from '../domain/entities/portfolio-contribution.entity';
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

  async findByOwnerId(ownerId: string): Promise<Portfolio[]> {
    const result = await this.model.find({ ownerId }).lean();
    return plainToInstance(Portfolio, result, { excludePrefixes: ['_', '__'] });
  }

  async findOne(uuid: string): Promise<Portfolio> {
    const result = await this.model.findOne({ uuid }).lean();
    return plainToInstance(Portfolio, result, { excludePrefixes: ['_', '__'] });
  }

  async deleteOne(uuid: string): Promise<void> {
    await this.model.deleteOne({ uuid });
  }

  async updateCash(uuid: string, cash: number): Promise<void> {
    await this.model.updateOne({ uuid }, { $set: { cash } });
  }

  async getContributions(
    uuid: string,
    offset: number,
    limit: number,
  ): Promise<PortfolioContribution[]> {
    const result = await this.model
      .aggregate()
      .match({ uuid })
      .project({ contributions: 1 })
      .unwind({ path: '$contributions' })
      .sort({ 'contributions.timestamp': -1 })
      .skip(offset)
      .limit(limit)
      .exec();

    return result.map((i) => i.contributions);
  }

  async getContributionsMetadata(uuid: string): Promise<ContributionsMetadata> {
    const results = await this.model
      .find(
        { uuid },
        {
          contributionsCount: { $size: '$contributions' },
          contributionsSum: { $sum: '$contributions.amountEUR' },
        },
      )
      .lean();

    return new ContributionsMetadata(
      results[0]?.contributionsCount ?? null,
      results[0]?.contributionsSum ?? null,
    );
  }

  async addContribution(
    uuid: string,
    contribution: PortfolioContribution,
  ): Promise<void> {
    const portfolio = await this.model.findOne({ uuid });
    portfolio.contributions.push({
      uuid: contribution.uuid,
      timestamp: new Date(contribution.timestamp),
      amountEUR: contribution.amountEUR,
    });
    await portfolio.save();
  }

  async deleteContribution(
    portfolioUuid: string,
    contributionUuid: string,
  ): Promise<void> {
    await this.model.updateOne(
      { uuid: portfolioUuid },
      { $pull: { contributions: { uuid: contributionUuid } } },
    );
  }
}
