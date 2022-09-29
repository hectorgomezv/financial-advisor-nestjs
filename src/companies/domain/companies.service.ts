import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CreateCompanyDto } from '../routes/dto/create-company.dto';
import { CompaniesRepository } from '../repositories/companies.repository';
import { Company } from './entities/company.entity';
import { CompanyStatesRepository } from '../repositories/company-states.repository';
import { IFinancialDataClient } from '../datasources/financial-data.client.interface';

@Injectable()
export class CompaniesService {
  constructor(
    private readonly repository: CompaniesRepository,
    private readonly companyStatesRepository: CompanyStatesRepository,
    @Inject(IFinancialDataClient)
    private readonly financialDataClient: IFinancialDataClient,
  ) {}

  async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    const exists = await this.repository.findBySymbol(createCompanyDto.symbol);

    if (exists) {
      throw new ConflictException(`Company ${exists.symbol} already exists`);
    }

    const company = await this.repository.create(<Company>{
      ...createCompanyDto,
      uuid: uuidv4(),
    });

    await this.createCompanyState(company);

    return company;
  }

  findAll(): Promise<Company[]> {
    return this.repository.findAll();
  }

  async findOne(uuid: string): Promise<Company> {
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

  private async createCompanyState(company: Company): Promise<void> {
    const quoteSummary = await this.financialDataClient.getQuoteSummary(
      company.symbol,
    );

    await this.companyStatesRepository.create(null);
  }
}
