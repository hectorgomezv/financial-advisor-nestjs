import { Injectable } from '@nestjs/common';
import { RedisClient } from '../../common/cache/redis.client';
import { DbService } from '../../common/db.service';
import { Company } from '../domain/entities/company.entity';
import { CreateCompanyDto } from '../domain/dto/create-company.dto';

export interface PgCompany {
  id: number;
  name: string;
  symbol: string;
}

@Injectable()
export class CompaniesPgRepository {
  private companyKey = 'company';

  constructor(
    private readonly db: DbService,
    private readonly redisClient: RedisClient,
  ) {}

  async create(dto: CreateCompanyDto): Promise<Company> {
    const query = `
      INSERT INTO companies (name, symbol)
      VALUES ($1, $2)
      RETURNING *;`;
    const res = await this.db.query<PgCompany>(query, [dto.name, dto.symbol]);
    return res.rows[0];
  }

  async findAll(): Promise<Company[]> {
    // TODO: implement caching
    // const cached = await this.redisClient.redis.get(this.companiesKey);
    // if (cached) {
    //   return JSON.parse(cached);
    // }
    // await this.redisClient.redis.set(this.companiesKey, JSON.stringify(result));
    const query = 'SELECT id, name, symbol FROM companies;';
    const res = await this.db.query<PgCompany>(query, []);
    return res.rows;
  }

  async findByIdIn(id: number[]): Promise<Company[]> {
    const query = `
      SELECT id, name, symbol
      FROM companies
      WHERE id = ANY($1::int[]);
    `;
    const res = await this.db.query<PgCompany>(query, [id]);
    return res.rows;
  }

  async findById(id: number): Promise<Company | null> {
    const query = 'SELECT id, name, symbol FROM companies WHERE id = $1;';
    const res = await this.db.query<PgCompany>(query, [id]);
    if (res.rowCount === 0) return null;
    return res.rows[0];
  }

  async findBySymbol(symbol: string): Promise<Company | null> {
    const query = 'SELECT id, name, symbol FROM companies WHERE symbol = $1;';
    const res = await this.db.query<PgCompany>(query, [symbol]);
    if (res.rowCount === 0) return null;
    return res.rows[0];
  }

  async deleteById(id: number): Promise<void> {
    const query = 'DELETE FROM companies WHERE id = $1;';
    await this.db.query<PgCompany>(query, [id]);
  }
}
