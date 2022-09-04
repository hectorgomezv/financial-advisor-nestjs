import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Company } from './entities/company.entity';
import { CompaniesRepository } from './companies.repository';

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

  findOne(uuid: string) {
    return this.repository.findOne(uuid);
  }

  update(id: number, updateCompanyDto: UpdateCompanyDto) {
    throw Error('Not implemented');
  }

  remove(uuid: string) {
    return this.repository.deleteOne(uuid);
  }
}
