import { Injectable } from '@nestjs/common';
import { CurrencyExchangeClient } from '../datasources/currency-exchange-client';
import { PortfolioStatesRepository } from '../repositories/portfolio-states.repository';
import { PortfolioState } from './entities/portfolio-state.entity';
import { Position } from './entities/position.entity';

@Injectable()
export class PortfolioStatesService {
  constructor(
    private readonly repository: PortfolioStatesRepository,
    private readonly exchangeClient: CurrencyExchangeClient,
  ) {}

  async createPortfolioState(portfolioUuid: string, positions: Position[]) {
    const sumWeights = positions.reduce(
      (acc, pos) => acc + pos.targetWeight,
      0,
    );
    const isValid = sumWeights === 100;
    const totalValueEUR = await this.getTotalValueEUR(positions);

    return this.repository.create(<PortfolioState>{
      portfolioUuid,
      isValid,
      sumWeights,
      totalValueEUR,
    });
  }

  private async getTotalValueEUR(positions: Position[]) {
    const fx = await this.exchangeClient.getFx();
    const totalValueUSD = positions.reduce((acc, pos) => acc + pos.value, 0);

    return fx(totalValueUSD).from('USD').to('EUR');
  }
}
