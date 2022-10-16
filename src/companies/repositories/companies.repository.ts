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
    public model: Model<CompanyDocument>,
  ) {}

  async create(company: Company): Promise<Company> {
    const created = (await this.model.create(company)).toObject();
    return plainToInstance(Company, created, { excludePrefixes: ['_', '__'] });
  }

  async findAll(): Promise<Company[]> {
    const result = await this.model.find().lean();
    return plainToInstance(Company, result, { excludePrefixes: ['_', '__'] });
  }

  async findByUuidIn(uuid: string[]): Promise<Company[]> {
    const result = await this.model.find({ uuid: { $in: uuid } }).lean();
    return plainToInstance(Company, result, { excludePrefixes: ['_', '__'] });
  }

  async findOne(uuid: string): Promise<Company> {
    const result = await this.model.findOne({ uuid }).lean();
    return plainToInstance(Company, result, { excludePrefixes: ['_', '__'] });
  }

  async findBySymbol(symbol: string): Promise<Company> {
    const result = await this.model.findOne({ symbol }).lean();
    return plainToInstance(Company, result, { excludePrefixes: ['_', '__'] });
  }

  async deleteOne(uuid: string): Promise<void> {
    await this.model.deleteOne({ uuid });
  }
}
