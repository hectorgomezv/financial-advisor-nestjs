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

  findAll() {
    return this.companyModel.find().exec();
  }

  findOne(uuid: string) {
    return this.companyModel.findOne({ uuid }).exec();
  }

  updateOne(id: number, company: Company) {
    return `This action updates a #${id} company`;
  }

  deleteOne(uuid: string) {
    return this.companyModel.deleteOne({ uuid });
  }
}
