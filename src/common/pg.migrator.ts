import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PgCompany } from '../companies/repositories/companies.pg.repository';
import {
  CompanyStateDocument,
  CompanyStateModel,
} from '../companies/repositories/schemas/company-state.schema';
import {
  CompanyDocument,
  CompanyModel,
} from '../companies/repositories/schemas/company.schema';
import {
  DbIndex,
  DbIndexState,
} from '../indices/repositories/indices.repository';
import {
  IndexDocument,
  IndexModel,
} from '../indices/repositories/schemas/index.schema';
import {
  PgPortfolio,
  PgPortfolioContribution,
  PgPortfolioState,
} from '../portfolios/repositories/portfolios.pg.repository';
import {
  PortfolioStateDocument,
  PortfolioStateModel,
} from '../portfolios/repositories/schemas/portfolio-state.schema';
import {
  PortfolioDocument,
  PortfolioModel,
} from '../portfolios/repositories/schemas/portfolio.schema';
import { DbService } from './db.service';
import {
  PositionDocument,
  PositionModel,
} from '../portfolios/repositories/schemas/position.schema';
import { PgPosition } from '../portfolios/repositories/positions.pg.repository';

@Injectable()
export class PgMigrator implements OnModuleInit {
  private ONE_YEAR_AGO = new Date(Date.now() - 1000 * 60 * 60 * 24 * 365);

  // uuid-id dictionaries
  private companiesMap: Map<string, number> = new Map();
  private portfoliosMap: Map<string, number> = new Map();

  constructor(
    @InjectModel(CompanyModel.name)
    public companyModel: Model<CompanyDocument>,
    @InjectModel(CompanyStateModel.name)
    public companyStateModel: Model<CompanyStateDocument>,
    @InjectModel(IndexModel.name)
    public indexModel: Model<IndexDocument>,
    @InjectModel(PortfolioModel.name)
    public portfolioModel: Model<PortfolioDocument>,
    @InjectModel(PortfolioStateModel.name)
    public portfolioStateModel: Model<PortfolioStateDocument>,
    @InjectModel(PositionModel.name)
    public positionModel: Model<PositionDocument>,
    private readonly db: DbService,
  ) {}

  async onModuleInit() {
    await this.migrateCompanies();
    await this.migrateStates();
    await this.migrateIndices();
    await this.migratePortfolios();
    await this.migratePositions();
  }

  private async migrateCompanies(): Promise<void> {
    const existing = await this.db.query('SELECT * FROM companies;', []);
    if (existing.rowCount === 0) {
      const toMigrate = await this.companyModel.find({}).lean();
      let count = 0;
      for (const c of toMigrate) {
        const inserted = await this.db.query<PgCompany>(
          'INSERT INTO companies (name, symbol) VALUES ($1, $2) RETURNING *;',
          [c.name, c.symbol],
        );
        this.companiesMap.set(c.uuid, inserted.rows[0].id);
        count += 1;
        console.log(`Migrated ${count} companies of ${toMigrate.length}`);
      }
    }
  }

  /**
   * Migrate last year states only.
   */
  private async migrateStates(): Promise<void> {
    const existing = await this.db.query('SELECT * FROM company_states;', []);
    if (existing.rowCount === 0) {
      const toMigrate = await this.companyStateModel
        .find({ timestamp: { $gte: this.ONE_YEAR_AGO } })
        .lean();
      let count = 0;
      for (const state of toMigrate) {
        const companyId = this.companiesMap.get(state.companyUuid);
        await this.db.query(
          `INSERT INTO company_states (
              company_id,
              currency,
              enterprise_to_ebitda,
              enterprise_to_revenue,
              forward_pe,
              price,
              profit_margin,
              short_percent,
              timestamp
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);`,
          [
            companyId!,
            state.currency,
            state.enterpriseToEbitda,
            state.enterpriseToRevenue,
            state.forwardPE,
            state.price,
            state.profitMargins,
            state.shortPercentOfFloat,
            state.timestamp,
          ],
        );
        count += 1;
        console.log(`Migrated ${count} company states of ${toMigrate.length}`);
      }
    }
  }

  private async migrateIndices(): Promise<void> {
    const existing = await this.db.query('SELECT * FROM indices;', []);
    if (existing.rowCount === 0) {
      const toMigrate = await this.indexModel.find().lean();
      let indicesCount = 0;
      for (const index of toMigrate) {
        const result = await this.db.query<DbIndex>(
          'INSERT INTO indices (name, symbol) VALUES ($1, $2) RETURNING *;',
          [index.name, index.symbol],
        );
        indicesCount += 1;
        console.log(`Migrated ${indicesCount} indices of ${toMigrate.length}`);
        let statesCount = 0;
        for (const state of index.values) {
          await this.db.query<DbIndexState>(
            'INSERT INTO index_states (index_id, timestamp, value) VALUES ($1, $2, $3);',
            [result.rows[0].id, state.timestamp, state.value],
          );
          statesCount += 1;
          console.log(
            `Migrated ${statesCount} of ${index.values.length} index states for index ${index.name}`,
          );
        }
      }
    }
  }

  private async migratePortfolios(): Promise<void> {
    const existing = await this.db.query<PgPortfolio>(
      'SELECT * FROM portfolios;',
      [],
    );
    if (existing.rowCount === 0) {
      const toMigrate = await this.portfolioModel.find().lean();
      let portfoliosCount = 0;
      for (const portfolio of toMigrate) {
        const result = await this.db.query<PgPortfolio>(
          'INSERT INTO portfolios (cash, created, name, owner_id) VALUES ($1, $2, $3, $4) RETURNING *;',
          [
            portfolio.cash,
            portfolio.created,
            portfolio.name,
            portfolio.ownerId,
          ],
        );
        this.portfoliosMap.set(portfolio.uuid, result.rows[0].id);
        portfoliosCount += 1;
        console.log(
          `Migrated ${portfoliosCount} portfolios of ${toMigrate.length}`,
        );
        let statesCount = 0;
        const statesToMigrate = await this.portfolioStateModel
          .find({
            portfolioUuid: portfolio.uuid,
          })
          .lean();
        for (const state of statesToMigrate) {
          await this.db.query<PgPortfolioState>(
            `INSERT INTO portfolio_states (
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
                $6,
                ROUND($7::NUMERIC, 5)
              );`,
            [
              result.rows[0].id,
              state.cash,
              state.isValid,
              state.roicEUR,
              state.sumWeights,
              state.timestamp,
              state.totalValueEUR,
            ],
          );
          statesCount += 1;
          console.log(
            `Migrated ${statesCount} of ${statesToMigrate.length} portfolio states for portfolio ${portfolio.name}`,
          );
        }
        let contributionsCount = 0;
        for (const contribution of portfolio.contributions) {
          await this.db.query<PgPortfolioContribution>(
            `
            INSERT INTO portfolio_contributions (portfolio_id, timestamp, amount_eur)
            VALUES ($1, $2, ROUND($3::NUMERIC, 2));
          `,
            [result.rows[0].id, contribution.timestamp, contribution.amountEUR],
          );
          contributionsCount += 1;
          console.log(
            `Migrated ${contributionsCount} of ${portfolio.contributions.length} portfolio contributions for portfolio ${portfolio.name}`,
          );
        }
      }
    }
  }

  private async migratePositions(): Promise<void> {
    const existing = await this.db.query<PgPosition>(
      'SELECT * FROM positions;',
      [],
    );
    if (existing.rowCount === 0) {
      const toMigrate = await this.positionModel.find().lean();
      let positionsCount = 0;
      for (const position of toMigrate) {
        await this.db.query(
          `
          INSERT INTO positions (portfolio_id, company_id, target_weight, shares, blocked, shares_updated_at)
          VALUES ($1, $2, ROUND($3::NUMERIC, 2), ROUND($4::NUMERIC, 2), $5, $6);
        `,
          [
            this.portfoliosMap.get(position.portfolioUuid)!,
            this.companiesMap.get(position.companyUuid)!,
            position.targetWeight,
            position.shares,
            position.blocked,
            position.sharesUpdatedAt ?? this.ONE_YEAR_AGO,
          ],
        );
        positionsCount += 1;
        console.log(
          `Migrated ${positionsCount} of ${toMigrate.length} positions`,
        );
      }
    }
  }
}
