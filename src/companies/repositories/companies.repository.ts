import { Injectable } from '@nestjs/common';
import { RedisClient } from '../../common/cache/redis.client';
import { DbService } from '../../common/db.service';
import { CreateCompanyDto } from '../domain/dto/create-company.dto';
import { Company } from '../domain/entities/company.entity';

export interface DbCompany {
  id: number;
  name: string;
  symbol: string;
}

@Injectable()
export class CompaniesRepository {
  constructor(
    private readonly db: DbService,
    private readonly redisClient: RedisClient,
  ) {}

  async create(dto: CreateCompanyDto): Promise<Company> {
    const query = `
      INSERT INTO companies (name, symbol)
      VALUES ($1, $2)
      RETURNING *;`;
    const res = await this.db.query<DbCompany>(query, [dto.name, dto.symbol]);
    return res.rows[0];
  }

  async findAll(): Promise<Company[]> {
    const query = 'SELECT id, name, symbol FROM companies;';
    const res = await this.db.query<DbCompany>(query, []);
    return res.rows;
  }

  async findByIdIn(id: number[]): Promise<Company[]> {
    const query = `
      SELECT id, name, symbol
      FROM companies
      WHERE id = ANY($1::int[]);
    `;
    const res = await this.db.query<DbCompany>(query, [id]);
    return res.rows;
  }

  async findById(id: number): Promise<Company | null> {
    const query = 'SELECT id, name, symbol FROM companies WHERE id = $1;';
    const res = await this.db.query<DbCompany>(query, [id]);
    if (res.rowCount === 0) return null;
    return res.rows[0];
  }

  async findBySymbol(symbol: string): Promise<Company | null> {
    const query = 'SELECT id, name, symbol FROM companies WHERE symbol = $1;';
    const res = await this.db.query<DbCompany>(query, [symbol]);
    if (res.rowCount === 0) return null;
    return res.rows[0];
  }

  async deleteById(id: number): Promise<void> {
    const query = 'DELETE FROM companies WHERE id = $1;';
    await this.db.query<DbCompany>(query, [id]);
  }
}
