import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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

  getLastByCompanyUuid(companyUuid: string) {
    return this.model.find({ companyUuid }).sort({ timestamp: -1 }).limit(1);
  }
}
