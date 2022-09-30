import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CreateCompanyDto } from '../routes/dto/create-company.dto';
import { CompaniesRepository } from '../repositories/companies.repository';
import { Company } from './entities/company.entity';
import { CompanyStatesService } from './company-states.service';
import { PositionsRepository } from '../../portfolios/repositories/positions.repository';

@Injectable()
export class CompaniesService {
  constructor(
    private readonly repository: CompaniesRepository,
    private readonly positionsRepository: PositionsRepository,
    private readonly companyStatesService: CompanyStatesService,
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

    await this.companyStatesService.createCompanyState(company);

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

    const positions = await this.positionsRepository.findByCompanyUuid(uuid);

    if (positions.length) {
      throw new ConflictException(
        `Positions for company ${company.symbol} still exist`,
      );
    }

    await this.positionsRepository.deleteByCompanyUuid(uuid);
    await this.repository.deleteOne(uuid);

    return company;
  }
}
