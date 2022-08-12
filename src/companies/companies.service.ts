import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { plainToClass } from 'class-transformer';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Company } from './entities/company.entity';
import { CompanyModel, CompanyDocument } from './schemas/company.schema';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectModel(CompanyModel.name)
    private companyModel: Model<CompanyDocument>,
  ) {}

  async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    try {
      const company = await this.companyModel.create({
        ...createCompanyDto,
        uuid: 'foo',
      });

      const obj = company.toObject();

      const transformed: Company = plainToClass(Company, obj);
      return transformed;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  findAll() {
    return this.companyModel.find().exec();
  }

  findOne(uuid: string) {
    return this.companyModel.findOne({ uuid }).exec();
  }

  update(id: number, updateCompanyDto: UpdateCompanyDto) {
    return `This action updates a #${id} company`;
  }

  remove(uuid: string) {
    return this.companyModel.deleteOne({ uuid });
  }
}
