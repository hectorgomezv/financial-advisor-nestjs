import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { sortBy } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { AuthService } from '../../common/auth/auth-service';
import { User } from '../../common/auth/entities/user.entity';
import { PositionsRepository } from '../../portfolios/repositories/positions.repository';
import { CreateCompanyDto } from '../domain/dto/create-company.dto';
import { CompaniesRepository } from '../repositories/companies.repository';
import { CompanyStatesService } from './company-states.service';
import { CompanyMetrics } from './entities/company-metrics.entity';
import { Company, CompanyWithState } from './entities/company.entity';

@Injectable()
export class CompaniesService implements OnApplicationBootstrap {
  private readonly logger = new Logger(CompaniesService.name);

  constructor(
    private readonly repository: CompaniesRepository,
    private readonly positionsRepository: PositionsRepository,
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

    const company = await this.repository.create(<Company>{
      ...createCompanyDto,
      uuid: uuidv4(),
      metrics: new CompanyMetrics(0, 0, 0),
    });

    const state = await this.companyStatesService.createCompanyState(company);

    return <CompanyWithState>{ ...company, state };
  }

  async findAll(): Promise<CompanyWithState[]> {
    const companies = await this.repository.findAll();
    const states = await this.companyStatesService.getLastStateByCompanyUuids(
      companies.map((company) => company.uuid),
    );

    return sortBy(
      companies.map(
        (company) =>
          <CompanyWithState>{
            ...company,
            state: states.find((state) => state.companyUuid === company.uuid),
          },
      ),
      'symbol',
    );
  }

  async findOne(uuid: string): Promise<CompanyWithState> {
    const company = await this.repository.findOne(uuid);

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const state =
      await this.companyStatesService.getLastStateByCompanyUuid(uuid);

    return <CompanyWithState>{ ...company, state };
  }

  async remove(user: User, uuid: string) {
    this.authService.checkAdmin(user);
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

    await this.companyStatesService.deleteByCompanyUuid(uuid);
    await this.repository.deleteOne(uuid);

    return company;
  }

  onApplicationBootstrap() {
    if (process.env.NODE_ENV === 'production') {
      return this.refreshAllStates();
    }
  }

  @Cron('0 50 9 * * *', { timeZone: 'America/New_York' })
  private refreshAllStatesAtMarketOpen() {
    return this.refreshAllStates();
  }

  @Cron('0 30 12 * * *', { timeZone: 'America/New_York' })
  private refreshAllStatesAtMidday() {
    return this.refreshAllStates();
  }

  @Cron('0 45 15 * * *', { timeZone: 'America/New_York' })
  private refreshAllStatesAtMarketClose() {
    return this.refreshAllStates();
  }

  private async refreshAllStates() {
    try {
      const companies = await this.repository.findAll();
      await Promise.all(
        companies.map(async (company) => {
          const companyState =
            await this.companyStatesService.createCompanyState(company);
          const metrics =
            await this.companyStatesService.getMetricsByCompanyUuid(
              company.uuid,
            );
          await this.repository.updateMetricsByUuid(company.uuid, metrics);
          this.logger.log(
            `${company.symbol} refreshed: price ${companyState.price} [PEG: ${companyState.peg} (avg: ${metrics.avgPeg}), EV/Rev: ${companyState.enterpriseToRevenue} (avg: ${metrics.avgEnterpriseToRevenue}), EV/Ebitda: ${companyState.enterpriseToEbitda} (avg: ${metrics.avgEnterpriseToEbitda}), Short %: ${companyState.shortPercentOfFloat}]`,
          );
        }),
      );
    } catch (err) {
      this.logger.error(
        `Error refreshing companies state from provider: ${err.message}`,
      );
    }
  }
}
