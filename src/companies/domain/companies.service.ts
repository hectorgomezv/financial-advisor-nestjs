import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CreateCompanyDto } from '../routes/dto/create-company.dto';
import { CompaniesRepository } from '../repositories/companies.repository';
import { Company } from './entities/company.entity';

@Injectable()
export class CompaniesService {
  constructor(private repository: CompaniesRepository) {}

  async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    try {
      return this.repository.create(<Company>{
        ...createCompanyDto,
        uuid: uuidv4(),
      });
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  findAll() {
    return this.repository.findAll();
  }

  async findOne(uuid: string) {
    const company = await this.repository.findOne(uuid);

    if (!company) {
      throw new NotFoundException();
    }

    return company;
  }

  remove(uuid: string) {
    return this.repository.deleteOne(uuid);
  }
}
