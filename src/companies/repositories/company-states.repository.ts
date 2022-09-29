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

  async getLastByCompanyUuid(companyUuid: string): Promise<CompanyState> {
    const result = await this.model
      .find({ companyUuid })
      .sort({ timestamp: -1 })
      .limit(1)
      .exec();

    return plainToInstance(CompanyState, result && result[0]);
  }
}
