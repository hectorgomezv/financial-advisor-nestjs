import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CreateCompanyDto } from '../routes/dto/create-company.dto';
import { CompaniesRepository } from '../repositories/companies.repository';
import { Company } from './entities/company.entity';

@Injectable()
export class CompaniesService {
  constructor(private readonly repository: CompaniesRepository) {}

  async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    const company = await this.repository.findBySymbol(createCompanyDto.symbol);

    if (company) {
      throw new ConflictException(`Company ${company.symbol} already exists`);
    }

    return this.repository.create(<Company>{
      ...createCompanyDto,
      uuid: uuidv4(),
    });
  }

  findAll() {
    return this.repository.findAll();
  }

  async findOne(uuid: string) {
    const company = await this.repository.findOne(uuid);

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }

  async remove(uuid: string) {
    const company = await this.repository.findOne(uuid);

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    await this.repository.deleteOne(uuid);

    return company;
  }
}
