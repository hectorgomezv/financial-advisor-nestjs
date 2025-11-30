import { Injectable } from '@nestjs/common';
import { DbService } from '../../common/db.service';
import { Position } from '../domain/entities/position.entity';
import Decimal from 'decimal.js';
import { UpdatePositionDto } from '../domain/dto/update-position.dto';
import { CreatePositionDto } from '../domain/dto/create-position.dto';

export interface DbPosition {
  id: number;
  portfolio_id: number;
  company_id: number;
  target_weight: string;
  shares: string;
  blocked: boolean;
  shares_updated_at: Date;
  value: string;
}

@Injectable()
export class PositionsPgRepository {
  constructor(private readonly db: DbService) {}

  async create(dto: CreatePositionDto): Promise<Position> {
    const query = `
        INSERT INTO positions (
          portfolio_id,
          company_id,
          target_weight,
          shares,
          blocked,
          shares_updated_at,
          value
        ) VALUES (
          $1,
          $2,
          ROUND($3::NUMERIC, 2),
          ROUND($4::NUMERIC, 2),
          $5,
          $6::TIMESTAMP,
          ROUND($7::NUMERIC, 5)
        ) RETURNING *;`;
    const { rows } = await this.db.query<DbPosition>(query, [
      dto.portfolioId,
      dto.companyId,
      dto.targetWeight.toString(),
      dto.shares.toString(),
      dto.blocked,
      dto.sharesUpdatedAt,
      new Decimal(0).toString(),
    ]);
    const row = rows[0];
    return {
      id: row.id,
      portfolioId: row.portfolio_id,
      companyId: row.company_id,
      blocked: row.blocked,
      shares: new Decimal(row.shares),
      sharesUpdatedAt: row.shares_updated_at,
      targetWeight: new Decimal(row.target_weight),
      value: new Decimal(row.value),
    };
  }

  async findById(id: number): Promise<Position | null> {
    const { rows } = await this.db.query<DbPosition>(
      'SELECT * FROM positions WHERE id = $1',
      [id],
    );
    if (rows.length === 0) return null;
    const row = rows[0];
    return {
      id: row.id,
      portfolioId: row.portfolio_id,
      companyId: row.company_id,
      blocked: row.blocked,
      shares: new Decimal(row.shares),
      sharesUpdatedAt: row.shares_updated_at,
      targetWeight: new Decimal(row.target_weight),
      value: new Decimal(row.value),
    };
  }

  async findByCompanyIdAndPortfolioId(
    companyId: number,
    portfolioId: number,
  ): Promise<Position | null> {
    const { rows } = await this.db.query<DbPosition>(
      'SELECT * FROM positions WHERE portfolio_id = $1 AND company_id = $2',
      [portfolioId, companyId],
    );
    if (rows.length === 0) return null;
    const row = rows[0];
    return {
      id: row.id,
      portfolioId: row.portfolio_id,
      companyId: row.company_id,
      blocked: row.blocked,
      shares: new Decimal(row.shares),
      sharesUpdatedAt: row.shares_updated_at,
      targetWeight: new Decimal(row.target_weight),
      value: new Decimal(row.value),
    };
  }

  async findByCompanyId(companyId: number): Promise<Array<Position>> {
    const { rows } = await this.db.query<DbPosition>(
      'SELECT * FROM positions WHERE company_id = $1',
      [companyId],
    );
    return rows.map((row) => ({
      id: row.id,
      portfolioId: row.portfolio_id,
      companyId: row.company_id,
      blocked: row.blocked,
      shares: new Decimal(row.shares),
      sharesUpdatedAt: row.shares_updated_at,
      targetWeight: new Decimal(row.target_weight),
      value: new Decimal(row.value),
    }));
  }

  async existByCompanyId(companyId: number): Promise<boolean> {
    const { rowCount } = await this.db.query(
      'SELECT id FROM positions WHERE company_id = $1 LIMIT 1',
      [companyId],
    );
    return rowCount !== 0;
  }

  async findByPortfolioId(portfolioId: number): Promise<Array<Position>> {
    const { rows } = await this.db.query<DbPosition>(
      'SELECT * FROM positions WHERE portfolio_id = $1',
      [portfolioId],
    );
    return rows.map((row) => ({
      id: row.id,
      portfolioId: row.portfolio_id,
      companyId: row.company_id,
      blocked: row.blocked,
      shares: new Decimal(row.shares),
      sharesUpdatedAt: row.shares_updated_at,
      targetWeight: new Decimal(row.target_weight),
      value: new Decimal(row.value),
    }));
  }

  async deleteByIdAndPortfolioId(
    id: number,
    portfolioId: number,
  ): Promise<void> {
    await this.db.query(
      'DELETE FROM positions WHERE id = $1 AND portfolio_id = $2;',
      [id, portfolioId],
    );
  }

  async update(id: number, update: UpdatePositionDto): Promise<void> {
    const query = `
        UPDATE positions SET 
          target_weight = ROUND($1::NUMERIC, 2),
          shares = ROUND($2::NUMERIC, 2),
          blocked = $3,
          shares_updated_at = $4::TIMESTAMP,
          value = ROUND($5::NUMERIC, 5)
        WHERE id = $6`;
    await this.db.query<DbPosition>(query, [
      update.targetWeight.toString(),
      update.shares.toString(),
      update.blocked,
      update.sharesUpdatedAt,
      update.value.toString(),
      id,
    ]);
  }
}
