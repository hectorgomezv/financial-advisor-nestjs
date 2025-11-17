import { Injectable, NotFoundException } from '@nestjs/common';
import Decimal from 'decimal.js';
import { DbService } from '../../common/db.service';
import { TimePeriod } from '../../common/domain/entities/time-period.entity';
import { CreatePortfolioStateDto } from '../domain/dto/create-portfolio-state.dto';
import { PortfolioAverageBalance } from '../domain/entities/portfolio-average-balance.entity';
import { PortfolioState } from '../domain/entities/portfolio-state.entity';
import {
  getRangeStartTimestamp,
  TimeRange,
} from '../domain/entities/time-range.enum';

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
export class PortfolioStatesPgRepository {
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
  ): Promise<Array<Partial<PortfolioAverageBalance>>> {
    const query = `
      SELECT
        DATE_TRUNC($1, timestamp) as start_date,
        AVG(total_value_eur) as average_balance
      FROM portfolio_states
      WHERE portfolio_id = $2 AND timestamp > $3::TIMESTAMP
      GROUP BY DATE_TRUNC($1, timestamp)
      ORDER BY start_date DESC;`;
    const startDate = getRangeStartTimestamp(range);
    const grouping = this.getGroupingForRange(range);
    const { rows } = await this.db.query<{
      start_date: Date;
      average_balance: string;
    }>(query, [grouping, portfolioId, startDate]);
    return rows.map((row) => ({
      average: new Decimal(row.average_balance),
      timestamp: row.start_date,
    }));
  }

  async getPortfolioStatesInPeriod(
    portfolioId: number,
    period: TimePeriod,
  ): Promise<Array<PortfolioState>> {
    const query = `
      SELECT *
      FROM portfolio_states
      WHERE
        portfolio_id = $1
        AND timestamp > $2::TIMESTAMP
        AND timestamp < $3::TIMESTAMP
      ORDER BY timestamp DESC
      LIMIT 1;`;
    const { rows } = await this.db.query<DbPortfolioState>(query, [
      portfolioId,
      period.start,
      period.end,
    ]);
    return rows.map((row) => ({
      id: row.id,
      portfolioId: row.portfolio_id,
      cash: new Decimal(row.cash),
      isValid: row.is_valid,
      roicEUR: new Decimal(row.roic_eur),
      sumWeights: new Decimal(row.sum_weights),
      timestamp: row.timestamp,
      totalValueEUR: new Decimal(row.total_value_eur),
    }));
  }

  private getGroupingForRange(range: TimeRange): string {
    switch (range) {
      case TimeRange.TwoYears:
      case TimeRange.ThreeYears:
      case TimeRange.FiveYears:
        return 'week';
      case TimeRange.Month:
      case TimeRange.TwoMonths:
      case TimeRange.ThreeMonths:
      case TimeRange.SixMonths:
      case TimeRange.Year:
        return 'day';
      case TimeRange.Week:
        return 'hour';
    }
  }
}
