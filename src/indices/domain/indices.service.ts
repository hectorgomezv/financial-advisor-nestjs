import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AuthService } from '../../common/auth/auth-service';
import { User } from '../../common/auth/entities/user.entity';
import { IFinancialDataClient } from '../../companies/datasources/financial-data.client.interface';
import { IndicesRepository } from '../repositories/indices.repository';

@Injectable()
export class IndicesService {
  private readonly logger = new Logger(IndicesService.name);

  constructor(
    private readonly repository: IndicesRepository,
    private readonly authService: AuthService,
    @Inject(IFinancialDataClient)
    private readonly financialDataClient: IFinancialDataClient,
  ) {}

  findAll(user: User) {
    this.authService.checkAdmin(user);
    return this.repository.findAll();
  }

  @Cron('0 34 9 * * *', { timeZone: 'America/New_York' })
  private refreshIndicesAtMarketOpen() {
    return this.refreshIndices();
  }

  @Cron('0 32 12 * * *', { timeZone: 'America/New_York' })
  private refreshIndicesAtMidday() {
    return this.refreshIndices();
  }

  @Cron('0 04 16 * * *', { timeZone: 'America/New_York' })
  private refreshIndicesAtMarketClose() {
    return this.refreshIndices();
  }

  private async refreshIndices() {
    const indices = await this.repository.findAll();
    await Promise.all(
      indices.map((i) => {
        this.financialDataClient.getChartDataPoints(i.symbol);
      }),
    );
  }
}
