import { Injectable, NotFoundException } from '@nestjs/common';
import Decimal from 'decimal.js';
import { User } from '../../common/auth/entities/user.entity';
import { DbService } from '../../common/db.service';
import { AddPortfolioContributionDto } from '../domain/dto/add-portfolio-contribution.dto';
import { CreatePortfolioDto } from '../domain/dto/create-portfolio.dto';
import { ContributionsMetadata } from '../domain/entities/contributions-metadata';
import { PortfolioContribution } from '../domain/entities/portfolio-contribution.entity';
import { Portfolio } from '../domain/entities/portfolio.entity';
import { wrapDatabaseOperation } from '../../common/db/wrap-database-operation';

export interface DbPortfolio {
  id: number;
  cash: string;
  created: Date;
  name: string;
  owner_id: string;
  contributions: Array<DbPortfolioContribution>;
}

export interface DbPortfolioContribution {
  id: number;
  portfolio_id: number;
  timestamp: Date;
  amount_eur: string;
}

export interface DbPortfolioState {
  id: number;
  portfolio_id: number;
  cash: string;
  is_valid: boolean;
  roic_eur: string;
  sum_weights: string;
  timestamp: Date;
  total_value_eur: string;
}

interface DbContributionsMetadata {
  count: string;
  sum: string;
}

@Injectable()
export class PortfoliosRepository {
  constructor(private readonly db: DbService) {}

  async create(dto: CreatePortfolioDto, user: User): Promise<Portfolio> {
    return wrapDatabaseOperation(async () => {
      const query = `
        INSERT INTO portfolios (cash, created, name, owner_id)
        VALUES (ROUND($1::NUMERIC, 2), $2::TIMESTAMP, $3, $4) RETURNING *;`;
      const { rows } = await this.db.query<DbPortfolio>(query, [
        0,
        new Date(),
        dto.name,
        user.id,
      ]);
      const row = rows[0];
      return {
        id: row.id,
        cash: new Decimal(row.cash),
        contributions: [],
        created: row.created,
        name: row.name,
        ownerId: row.owner_id,
        positions: [],
        state: null,
      };
    });
  }

  async findAll(): Promise<Array<Portfolio>> {
    return wrapDatabaseOperation(async () => {
      const query = `
        SELECT
          p.id,
          p.name,
          p.owner_id,
          p.created,
          p.cash,
          COALESCE(
            json_agg(
              json_build_object('id', pc.id, 'portfolio_id', pc.portfolio_id, 'timestamp', pc.timestamp, 'amount_eur', pc.amount_eur)
              ORDER BY pc.timestamp DESC
            ) FILTER (WHERE pc.id IS NOT NULL),
          '[]') AS contributions
        FROM portfolios p LEFT JOIN portfolio_contributions pc ON p.id = pc.portfolio_id 
        GROUP BY p.id;`;
      const { rows } = await this.db.query<DbPortfolio>(query, []);
      return rows.map((row) => ({
        id: row.id,
        cash: new Decimal(row.cash),
        contributions: row.contributions.map((pc) => ({
          id: pc.id,
          portfolioId: pc.portfolio_id,
          timestamp: pc.timestamp,
          amountEUR: new Decimal(pc.amount_eur),
        })),
        created: row.created,
        name: row.name,
        ownerId: row.owner_id,
        positions: [],
        state: null,
      }));
    });
  }

  async findByOwnerId(ownerId: string): Promise<Array<Portfolio>> {
    return wrapDatabaseOperation(async () => {
      const query = `
        SELECT
          p.id,
          p.name,
          p.owner_id,
          p.created,
          p.cash,
          COALESCE(
            json_agg(
              json_build_object('id', pc.id, 'portfolio_id', pc.portfolio_id, 'timestamp', pc.timestamp, 'amount_eur', pc.amount_eur)
              ORDER BY pc.timestamp DESC
            ) FILTER (WHERE pc.id IS NOT NULL),
          '[]') AS contributions
        FROM portfolios p LEFT JOIN portfolio_contributions pc ON p.id = pc.portfolio_id 
        WHERE p.owner_id = $1
        GROUP BY p.id;`;
      const { rows } = await this.db.query<DbPortfolio>(query, [ownerId]);
      return rows.map((row) => ({
        id: row.id,
        cash: new Decimal(row.cash),
        contributions: row.contributions.map((pc) => ({
          id: pc.id,
          portfolioId: pc.portfolio_id,
          timestamp: pc.timestamp,
          amountEUR: new Decimal(pc.amount_eur),
        })),
        created: row.created,
        name: row.name,
        ownerId: row.owner_id,
        positions: [],
        state: null,
      }));
    });
  }

  async findById(id: number): Promise<Portfolio | null> {
    return wrapDatabaseOperation(async () => {
      const query = `
        SELECT
          p.id,
          p.name,
          p.owner_id,
          p.created,
          p.cash,
          COALESCE(
            json_agg(
              json_build_object('id', pc.id, 'portfolio_id', pc.portfolio_id, 'timestamp', pc.timestamp, 'amount_eur', pc.amount_eur)
              ORDER BY pc.timestamp DESC
            ) FILTER (WHERE pc.id IS NOT NULL),
          '[]') AS contributions
        FROM portfolios p LEFT JOIN portfolio_contributions pc ON p.id = pc.portfolio_id
        WHERE p.id = $1
        GROUP BY p.id;`;
      const { rows } = await this.db.query<DbPortfolio>(query, [id]);
      if (rows.length === 0) return null;
      const row = rows[0];
      return {
        id: row.id,
        cash: new Decimal(row.cash),
        contributions: row.contributions.map((pc) => ({
          id: pc.id,
          portfolioId: pc.portfolio_id,
          timestamp: pc.timestamp,
          amountEUR: new Decimal(pc.amount_eur),
        })),
        created: row.created,
        name: row.name,
        ownerId: row.owner_id,
        positions: [],
        state: null,
      };
    });
  }

  async findByIdWithContributions(id: number): Promise<Portfolio | null> {
    return wrapDatabaseOperation(async () => {
      const query = `
        SELECT
          p.id,
          p.name,
          p.owner_id,
          p.created,
          p.cash,
          COALESCE(
            json_agg(
              json_build_object('id', pc.id, 'portfolio_id', pc.portfolio_id, 'timestamp', pc.timestamp, 'amount_eur', pc.amount_eur)
              ORDER BY pc.timestamp DESC
            ) FILTER (WHERE pc.id IS NOT NULL),
          '[]') AS contributions
        FROM portfolios p LEFT JOIN portfolio_contributions pc ON p.id = pc.portfolio_id 
        WHERE p.id = $1
        GROUP BY p.id;`;
      const { rows } = await this.db.query<DbPortfolio>(query, [id]);
      if (rows.length === 0) return null;
      const row = rows[0];
      return {
        id: row.id,
        cash: new Decimal(row.cash),
        contributions: row.contributions.map((pc) => ({
          id: pc.id,
          portfolioId: pc.portfolio_id,
          timestamp: pc.timestamp,
          amountEUR: new Decimal(pc.amount_eur),
        })),
        created: row.created,
        name: row.name,
        ownerId: row.owner_id,
        positions: [],
        state: null,
      };
    });
  }

  async deleteById(id: number): Promise<void> {
    return wrapDatabaseOperation(async () => {
      await this.db.query('DELETE FROM portfolios WHERE id = $1;', [id]);
    });
  }

  async updateCash(id: number, cash: Decimal): Promise<void> {
    return wrapDatabaseOperation(async () => {
      await this.db.runTransaction(async (client) => {
        const { rowCount } = await client.query<DbPortfolio>(
          'SELECT * FROM portfolios WHERE id = $1;',
          [id],
        );
        if (rowCount === 0) throw new NotFoundException();
        await client.query('UPDATE portfolios SET cash = $1 WHERE id = $2;', [
          cash.toString(),
          id,
        ]);
      });
    });
  }

  async getContributions(
    portfolioId: number,
    offset: number,
    limit: number,
  ): Promise<Array<PortfolioContribution>> {
    return wrapDatabaseOperation(async () => {
      const query = `
        SELECT id, portfolio_id, timestamp, amount_eur
        FROM portfolio_contributions
        WHERE portfolio_id = $1
        ORDER BY timestamp DESC
        LIMIT $2
        OFFSET $3;`;
      const { rows } = await this.db.query<DbPortfolioContribution>(query, [
        portfolioId,
        limit,
        offset,
      ]);
      return rows.map((row) => ({
        id: row.id,
        portfolioId: row.portfolio_id,
        timestamp: row.timestamp,
        amountEUR: new Decimal(row.amount_eur),
      }));
    });
  }

  async getContributionsMetadata(
    portfolioId: number,
  ): Promise<ContributionsMetadata> {
    return wrapDatabaseOperation(async () => {
      const query = `
        SELECT count(id), COALESCE(sum(amount_eur), 0) as sum
        FROM portfolio_contributions
        WHERE portfolio_id = $1;`;
      const { rows } = await this.db.query<DbContributionsMetadata>(query, [
        portfolioId,
      ]);
      const row = rows[0];
      return {
        count: Number(row.count),
        sum: new Decimal(row.sum),
      };
    });
  }

  async addContribution(
    portfolioId: number,
    dto: AddPortfolioContributionDto,
  ): Promise<void> {
    return wrapDatabaseOperation(async () => {
      await this.db.runTransaction(async (client) => {
        const { rowCount } = await client.query<DbPortfolio>(
          'SELECT * FROM portfolios WHERE id = $1;',
          [portfolioId],
        );
        if (rowCount === 0) throw new NotFoundException();
        const query = `
          INSERT INTO portfolio_contributions (portfolio_id, timestamp, amount_eur)
          VALUES ($1, $2::TIMESTAMP, ROUND($3::NUMERIC, 2))`;
        await client.query(query, [portfolioId, dto.timestamp, dto.amountEUR]);
      });
    });
  }

  async deleteContributionById(id: number): Promise<void> {
    return wrapDatabaseOperation(async () => {
      await this.db.query(
        'DELETE FROM portfolio_contributions WHERE id = $1;',
        [id],
      );
    });
  }
}
