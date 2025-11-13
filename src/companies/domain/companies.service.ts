import {
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
import { CompaniesPgRepository } from '../repositories/companies.pg.repository';
import { CompanyStatesService } from './company-states.service';
import {
  CompanyWithState,
  CompanyWithStateAndMetrics,
} from './entities/company.entity';

@Injectable()
export class CompaniesService implements OnApplicationBootstrap {
  private readonly logger = new Logger(CompaniesService.name);

  constructor(
    private readonly repository: CompaniesPgRepository,
    private readonly authService: AuthService,
    private readonly companyStatesService: CompanyStatesService,
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

    // TODO: check if positions for company exist

    await this.companyStatesService.deleteByCompanyId(id);
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
        companies.map(async (company) => {
          await this.companyStatesService.createCompanyState(company);
          // const metrics = await this.companyStatesService.getMetricsByCompanyId(
          //   company.id,
          // );
          // await this.repository.updateMetricsByUuid(company.uuid!, metrics); // TODO: id or JOIN instead of uuid
          // this.logger.log(
          //   `${company.symbol} refreshed: price ${companyState.price} [ForwardPE: ${companyState.forwardPE} (avg: ${metrics.avgForwardPE}), profitMargins: ${companyState.profitMargins} (avg: ${metrics.avgProfitMargins}), EV/Rev: ${companyState.enterpriseToRevenue} (avg: ${metrics.avgEnterpriseToRevenue}), EV/Ebitda: ${companyState.enterpriseToEbitda} (avg: ${metrics.avgEnterpriseToEbitda}), Short %: ${companyState.shortPercentOfFloat}]`,
          // );
        }),
      );
    } catch (err) {
      this.logger.error(
        `Error refreshing companies state from provider: ${err.message}`,
      );
    }
  }
}
