import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToClass } from 'class-transformer';
import { Model } from 'mongoose';
import { Company } from './entities/company.entity';
import { CompanyDocument, CompanyModel } from './schemas/company.schema';

@Injectable()
export class CompaniesRepository {
  constructor(
    @InjectModel(CompanyModel.name)
    private companyModel: Model<CompanyDocument>,
  ) {}

  async create(company: Company): Promise<Company> {
    const created = await this.companyModel.create(company);
    const obj = created.toObject();
    const transformed: Company = plainToClass(Company, obj);

    return transformed;
  }

  findAll() {
    return this.companyModel.find().exec();
  }

  findOne(uuid: string) {
    return this.companyModel.findOne({ uuid }).exec();
  }

  update(id: number, company: Company) {
    return `This action updates a #${id} company`;
  }

  remove(uuid: string) {
    return this.companyModel.deleteOne({ uuid });
  }
}
