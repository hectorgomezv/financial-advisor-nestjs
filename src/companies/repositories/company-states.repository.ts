import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { Model } from 'mongoose';
import { CompanyState } from '../domain/entities/company-state.entity';
import {
  CompanyStateDocument,
  CompanyStateModel,
} from './schemas/company-state.schema';

@Injectable()
export class CompanyStatesRepository {
  constructor(
    @InjectModel(CompanyStateModel.name)
    private model: Model<CompanyStateDocument>,
  ) {}

  async create(companyState: CompanyState): Promise<CompanyState> {
    const created = (await this.model.create(companyState)).toObject();
    return plainToInstance(CompanyState, created);
  }

  async deleteByCompanyUuid(companyUuid: string): Promise<void> {
    await this.model.deleteMany({ companyUuid });
  }

  async getLastByCompanyUuid(companyUuid: string): Promise<CompanyState> {
    const result = await this.model
      .findOne({ companyUuid })
      .sort({ timestamp: -1 })
      .limit(1)
      .lean();

    return plainToInstance(CompanyState, result);
  }

  async getLastByCompanyUuids(companyUuids: string[]): Promise<CompanyState[]> {
    const result = await this.model
      .aggregate()
      .match({ companyUuid: { $in: companyUuids } })
      .group({ _id: '$companyUuid', state: { $last: '$$ROOT' } })
      .lookup({
        from: 'companies',
        localField: '_id',
        foreignField: 'uuid',
        as: 'company',
      })
      .exec();

    return plainToInstance(CompanyState, result);
  }
}
