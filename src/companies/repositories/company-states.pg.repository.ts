import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import Decimal from 'decimal.js';
import { Model } from 'mongoose';
import { RedisClient } from '../../common/cache/redis.client';
import { DbService } from '../../common/db.service';
import { CreateCompanyStateDto } from '../domain/company-states.service';
import { CompanyMetrics } from '../domain/entities/company-metrics.entity';
import { CompanyState } from '../domain/entities/company-state.entity';
import {
  CompanyStateDocument,
  CompanyStateModel,
} from './schemas/company-state.schema';

export interface DbCompany {
  id: number;
  company_id: number;
  currency: string;
  enterprise_to_ebitda: string;
  enterprise_to_revenue: string;
  forward_pe: string;
  price: string;
  profit_margin: string;
  short_percent: string;
  timestamp: Date;
}

interface DbCompanyMetrics {
  avg_enterprise_to_revenue: string;
  avg_enterprise_to_ebitda: string;
  avg_forward_pe: string;
  avg_profit_margins: string;
}

@Injectable()
export class CompanyStatesPgRepository {
  private readonly logger = new Logger(CompanyStatesPgRepository.name);
  // TODO: caching

  constructor(
    @InjectModel(CompanyStateModel.name)
    private model: Model<CompanyStateDocument>,
    private readonly db: DbService,
    private readonly redisClient: RedisClient,
  ) {}

  async create(dto: CreateCompanyStateDto): Promise<CompanyState> {
    const query = `
      INSERT INTO company_states (
        company_id,
        currency,
        enterprise_to_ebitda,
        enterprise_to_revenue,
        forward_pe,
        price,
        profit_margin,
        short_percent,
        timestamp
      ) VALUES (
       $1,
       $2,
       ROUND($3::NUMERIC, 5),
       ROUND($4::NUMERIC, 5),
       ROUND($5::NUMERIC, 5),
       ROUND($6::NUMERIC, 2),
       ROUND($7::NUMERIC, 5),
       ROUND($8::NUMERIC, 5),
       $9::TIMESTAMP
      ) RETURNING *;`;
    const { rows } = await this.db.query<DbCompany>(query, [
      dto.companyId,
      dto.currency,
      dto.enterpriseToEbitda.toString(),
      dto.enterpriseToRevenue.toString(),
      dto.forwardPE.toString(),
      dto.price.toString(),
      dto.profitMargins.toString(),
      dto.shortPercentOfFloat.toString(),
      dto.timestamp,
    ]);
    const row = rows[0];
    return {
      id: row.id,
      companyId: row.company_id,
      timestamp: row.timestamp,
      price: new Decimal(row.price),
      currency: row.currency,
      forwardPE: new Decimal(row.forward_pe),
      profitMargins: new Decimal(row.profit_margin),
      enterpriseToRevenue: new Decimal(row.enterprise_to_revenue),
      enterpriseToEbitda: new Decimal(row.enterprise_to_ebitda),
      shortPercentOfFloat: new Decimal(row.short_percent),
    };
  }

  // async deleteByCompanyUuid(companyUuid: string): Promise<void> {}

  async getLastByCompanyId(companyId: number): Promise<CompanyState | null> {
    const query = `
      SELECT DISTINCT ON (cs.company_id)
        c.id,
        c.name,
        c.symbol,
        cs.company_id,
        cs.currency,
        cs.enterprise_to_ebitda,
        cs.enterprise_to_revenue,
        cs.forward_pe, cs.price,
        cs.profit_margin,
        cs.short_percent,
        cs.timestamp
      FROM companies c JOIN company_states cs ON c.id = cs.company_id
      WHERE c.id = $1
      ORDER BY cs.company_id, cs.timestamp DESC;`;
    const { rows } = await this.db.query(query, [companyId]);
    if (!rows.length) return null;
    const row = rows[0];
    return {
      id: row.id,
      companyId: row.company_id,
      timestamp: row.timestamp,
      price: new Decimal(row.price),
      currency: row.currency,
      forwardPE: new Decimal(row.forward_pe),
      profitMargins: new Decimal(row.profit_margin),
      enterpriseToRevenue: new Decimal(row.enterprise_to_revenue),
      enterpriseToEbitda: new Decimal(row.enterprise_to_ebitda),
      shortPercentOfFloat: new Decimal(row.short_percent),
    };
  }

  async getLastByCompanyIds(
    companyIds: Array<number>,
  ): Promise<Array<CompanyState>> {
    const query = `
      SELECT DISTINCT ON (cs.company_id)
        cs.id as id,
        c.id as company_id,
        c.name,
        c.symbol,
        cs.currency,
        cs.enterprise_to_ebitda,
        cs.enterprise_to_revenue,
        cs.forward_pe, cs.price,
        cs.profit_margin,
        cs.short_percent,
        cs.timestamp
      FROM companies c JOIN company_states cs ON c.id = cs.company_id
      WHERE c.id = ANY($1::int[])
      ORDER BY cs.company_id, cs.timestamp DESC;`;
    const { rows } = await this.db.query(query, [companyIds]);
    return rows.map((row) => ({
      id: row.id,
      companyId: row.company_id,
      timestamp: row.timestamp,
      price: new Decimal(row.price),
      currency: row.currency,
      forwardPE: new Decimal(row.forward_pe),
      profitMargins: new Decimal(row.profit_margin),
      enterpriseToRevenue: new Decimal(row.enterprise_to_revenue),
      enterpriseToEbitda: new Decimal(row.enterprise_to_ebitda),
      shortPercentOfFloat: new Decimal(row.short_percent),
    }));
  }

  async deleteByCompanyId(id: number): Promise<void> {
    const query = 'DELETE FROM company_states WHERE company_id = $1;';
    await this.db.query(query, [id]);
  }

  /**
   * Gets {@link CompanyMetrics} for the last year.
   */
  async getMetricsByCompanyId(
    companyId: number,
  ): Promise<CompanyMetrics | null> {
    const query = `
      SELECT
	      AVG(enterprise_to_revenue) AS avg_enterprise_to_revenue,
	      AVG(enterprise_to_ebitda) AS avg_enterprise_to_ebitda,
	      AVG(forward_pe) AS avg_forward_pe, 
	      AVG(profit_margin) AS avg_profit_margins
      FROM company_states
      WHERE company_id = $1;
    `;
    const { rows } = await this.db.query<DbCompanyMetrics>(query, [companyId]);
    if (!rows.length) return null;
    const row = rows[0];
    return {
      avgEnterpriseToRevenue: new Decimal(row.avg_enterprise_to_revenue),
      avgEnterpriseToEbitda: new Decimal(row.avg_enterprise_to_ebitda),
      avgForwardPE: new Decimal(row.avg_forward_pe),
      avgProfitMargins: new Decimal(row.avg_profit_margins),
    };
  }
}
