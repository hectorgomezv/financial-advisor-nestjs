import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { sortBy } from 'lodash';
import { AuthService } from '../../common/auth/auth-service';
import { User } from '../../common/auth/entities/user.entity';
import { CreateCompanyDto } from '../domain/dto/create-company.dto';
import { CompaniesRepository } from '../repositories/companies.repository';
import { CompanyStatesService } from './company-states.service';
import {
  CompanyWithState,
  CompanyWithStateAndMetrics,
} from './entities/company.entity';
import { PositionsRepository } from '../../portfolios/repositories/positions.repository';

@Injectable()
export class CompaniesService implements OnApplicationBootstrap {
  private readonly logger = new Logger(CompaniesService.name);

  constructor(
    private readonly repository: CompaniesRepository,
    private readonly authService: AuthService,
    private readonly companyStatesService: CompanyStatesService,
    private readonly positionsRepository: PositionsRepository,
  ) {}

  async create(
    user: User,
    createCompanyDto: CreateCompanyDto,
  ): Promise<CompanyWithState> {
    this.authService.checkAdmin(user);
    const exists = await this.repository.findBySymbol(createCompanyDto.symbol);
    if (exists) {
      throw new ConflictException(`Company ${exists.symbol} already exists`);
    }
    const company = await this.repository.create(createCompanyDto);
    const state = await this.companyStatesService.createCompanyState(company);

    return <CompanyWithState>{ ...company, state };
  }

  async getCompaniesWithMetricsAndState(): Promise<
    Array<CompanyWithStateAndMetrics>
  > {
    const companies = await this.repository.findAll();
    const states = await this.companyStatesService.getLastByCompanyIds(
      companies.map((company) => company.id),
    );
    const res: Array<CompanyWithStateAndMetrics> = [];
    for (const company of companies) {
      const state = states.find((state) => state.companyId === company.id);
      const metrics = await this.companyStatesService.getMetricsByCompanyId(
        company.id,
      );
      res.push({
        ...company,
        metrics,
        state: state ?? null,
      });
    }
    return sortBy(res, 'symbol');
  }

  async findById(id: number): Promise<CompanyWithStateAndMetrics> {
    const company = await this.repository.findById(id);
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    const state = await this.companyStatesService.getLastByCompanyId(id);
    const metrics = await this.companyStatesService.getMetricsByCompanyId(
      company.id,
    );
    return <CompanyWithStateAndMetrics>{ ...company, state, metrics };
  }

  async remove(user: User, id: number) {
    this.authService.checkAdmin(user);
    const company = await this.repository.findById(id);
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    const positionsExist = await this.positionsRepository.existByCompanyId(
      company.id,
    );
    if (positionsExist) {
      throw new BadRequestException(
        `Positions exist for the company ${company.name}`,
      );
    }
    await this.repository.deleteById(id);
    return company;
  }

  onApplicationBootstrap() {
    if (process.env.NODE_ENV === 'production') {
      return this.refreshAllStates();
    }
  }

  @Cron('0 49 9 * * *', { timeZone: 'America/New_York' })
  private refreshAllStatesAtMarketOpen() {
    return this.refreshAllStates();
  }

  @Cron('0 29 12 * * *', { timeZone: 'America/New_York' })
  private refreshAllStatesAtMidday() {
    return this.refreshAllStates();
  }

  @Cron('0 44 15 * * *', { timeZone: 'America/New_York' })
  private refreshAllStatesAtMarketClose() {
    return this.refreshAllStates();
  }

  private async refreshAllStates() {
    try {
      const companies = await this.repository.findAll();
      await Promise.all(
        companies.map(async (c) =>
          this.companyStatesService.createCompanyState(c),
        ),
      );
    } catch (err) {
      this.logger.error(
        `Error refreshing companies state from provider: ${err.message}`,
      );
    }
  }
}
