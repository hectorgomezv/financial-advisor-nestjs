import { Injectable, NotFoundException } from '@nestjs/common';
import { DbService } from '../../common/db.service';
import { TimePeriod } from '../../common/domain/entities/time-period.entity';
import { PortfolioAverageBalance } from '../domain/entities/portfolio-average-balance.entity';
import { PortfolioState } from '../domain/entities/portfolio-state.entity';
import { TimeRange } from '../domain/entities/time-range.enum';
import Decimal from 'decimal.js';
import { CreatePortfolioStateDto } from '../domain/dto/create-portfolio-state.dto';

interface DbPortfolioState {
  id: number;
  portfolio_id: number;
  cash: string;
  is_valid: boolean;
  roic_eur: string;
  sum_weights: string;
  timestamp: Date;
  total_value_eur: string;
}

@Injectable()
export class PortfolioStatesRepository {
  constructor(private readonly db: DbService) {}

  async getLastByPortfolioId(portfolioId: number): Promise<PortfolioState> {
    const query = `
      SELECT *
      FROM portfolio_states
      WHERE portfolio_id = $1
      ORDER BY timestamp DESC
      LIMIT 1;`;
    const { rows } = await this.db.query<DbPortfolioState>(query, [
      portfolioId,
    ]);
    if (rows.length === 0) throw new NotFoundException();
    const row = rows[0];
    return {
      id: row.id,
      portfolioId: row.portfolio_id,
      cash: new Decimal(row.cash),
      isValid: row.is_valid,
      roicEUR: new Decimal(row.roic_eur),
      sumWeights: new Decimal(row.sum_weights),
      timestamp: row.timestamp,
      totalValueEUR: new Decimal(row.total_value_eur),
    };
  }

  async create(dto: CreatePortfolioStateDto): Promise<PortfolioState> {
    const query = `
      INSERT INTO portfolio_states (
        portfolio_id,
        cash,
        is_valid,
        roic_eur,
        sum_weights,
        timestamp,
        total_value_eur
      ) VALUES (
        $1,
        ROUND($2::NUMERIC, 2),
        $3,
        ROUND($4::NUMERIC, 5),
        ROUND($5::NUMERIC, 5),
        $6::TIMESTAMP,
        ROUND($7::NUMERIC, 5)
      ) RETURNING *;`;
    const { rows } = await this.db.query<DbPortfolioState>(query, [
      dto.portfolioId,
      dto.cash.toString(),
      dto.isValid,
      dto.roicEUR.toString(),
      dto.sumWeights.toString(),
      dto.timestamp,
      dto.totalValueEUR.toString(),
    ]);
    const row = rows[0];
    return {
      id: row.id,
      portfolioId: row.portfolio_id,
      cash: new Decimal(row.cash),
      isValid: row.is_valid,
      roicEUR: new Decimal(row.roic_eur),
      sumWeights: new Decimal(row.sum_weights),
      timestamp: row.timestamp,
      totalValueEUR: new Decimal(row.total_value_eur),
    };
  }

  async deleteByPortfolioId(portfolioId: number): Promise<void> {
    await this.db.query(
      'DELETE FROM portfolio_states. WHERE portfolio_id = $1;',
      [portfolioId],
    );
  }

  async getAverageBalancesForRange(
    portfolioId: number,
    range: TimeRange,
  ): Promise<Partial<PortfolioAverageBalance>[]> {}

  async getPortfolioStatesInPeriod(
    portfolioId: number,
    period: TimePeriod,
  ): Promise<Partial<PortfolioState>[]> {}

  private getGroupingForRange(range: TimeRange) {
    switch (range) {
      case TimeRange.TwoYears:
      case TimeRange.ThreeYears:
      case TimeRange.FiveYears:
        return {
          year: { $year: '$parsedDate' },
          week: { $week: '$parsedDate' },
        };
      case TimeRange.Month:
      case TimeRange.TwoMonths:
      case TimeRange.ThreeMonths:
      case TimeRange.SixMonths:
      case TimeRange.Year:
        return {
          year: { $year: '$parsedDate' },
          day: { $dayOfYear: '$parsedDate' },
        };
      case TimeRange.Week:
        return {
          year: { $year: '$parsedDate' },
          day: { $dayOfYear: '$parsedDate' },
          hour: { $hour: '$parsedDate' },
        };
    }
  }

  private mapToPortfolioAverageBalance(
    item: any,
    range: TimeRange,
  ): Partial<PortfolioAverageBalance> {
    const { _id, average } = item;

    switch (range) {
      case TimeRange.TwoYears:
      case TimeRange.ThreeYears:
      case TimeRange.FiveYears:
        return {
          timestamp: new Date(_id.year, 0, 1 + (_id.week - 1) * 7, 0),
          average,
        };
      case TimeRange.Week:
      case TimeRange.Month:
      case TimeRange.TwoMonths:
      case TimeRange.ThreeMonths:
      case TimeRange.SixMonths:
      case TimeRange.Year:
        return {
          timestamp: new Date(_id.year, 0, _id.day, _id.hour ?? 0),
          average,
        };
    }
  }
}
