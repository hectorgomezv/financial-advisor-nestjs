import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { Model } from 'mongoose';
import { Company } from '../domain/entities/company.entity';
import { CompanyDocument, CompanyModel } from './schemas/company.schema';

@Injectable()
export class CompaniesRepository {
  constructor(
    @InjectModel(CompanyModel.name)
    private companyModel: Model<CompanyDocument>,
  ) {}

  async create(company: Company): Promise<Company> {
    const created = (await this.companyModel.create(company)).toObject();
    return plainToInstance(Company, created);
  }

  async findAll(): Promise<Company[]> {
    const result = await this.companyModel.find().exec();
    return plainToInstance(
      Company,
      result.map((i) => i.toObject()),
    );
  }

  async findByUuidIn(uuid: string[]): Promise<Company[]> {
    const result = await this.companyModel.find({ uuid: { $in: uuid } }).exec();
    return plainToInstance(
      Company,
      result.map((i) => i.toObject()),
    );
  }

  async findOne(uuid: string): Promise<Company> {
    const result = (
      await this.companyModel.findOne({ uuid }).exec()
    )?.toObject();
    return plainToInstance(Company, result);
  }

  async findBySymbol(symbol: string): Promise<Company> {
    const result = (await this.companyModel.findOne({ symbol }))?.toObject();
    return plainToInstance(Company, result);
  }

  async deleteOne(uuid: string): Promise<void> {
    await this.companyModel.deleteOne({ uuid });
  }
}
