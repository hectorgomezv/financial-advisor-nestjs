import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CompanyDocument, CompanyModel } from './schemas/company.schema';
import { DbService } from '../../common/db.service';
import { CompaniesPgRepository, PgCompany } from './companies.pg.repository';
import {
  CompanyStateDocument,
  CompanyStateModel,
} from './schemas/company-state.schema';

@Injectable()
export class CompaniesMigrator implements OnModuleInit {
  private readonly logger = new Logger(CompaniesMigrator.name);
  private map: Map<string, number> = new Map(); // uuid-id dictionary

  constructor(
    @InjectModel(CompanyModel.name)
    public companyModel: Model<CompanyDocument>,
    @InjectModel(CompanyStateModel.name)
    public companyStateModel: Model<CompanyStateDocument>,
    private readonly db: DbService,
  ) {}

  async onModuleInit() {
    await this.migrateCompanies();
    await this.migrateStates();
  }

  private async migrateCompanies(): Promise<void> {
    const existing = await this.db.query('SELECT * FROM companies;', []);
    if (existing.rowCount === 0) {
      const toMigrate = await this.companyModel.find().lean();
      this.logger.log(`Migrating ${toMigrate.length} companies`);
      for (const c of toMigrate) {
        const inserted = await this.db.query<PgCompany>(
          'INSERT INTO companies (name, symbol) VALUES ($1, $2) RETURNING *;',
          [c.name, c.symbol],
        );
        this.map.set(c.uuid, inserted.rows[0].id);
      }
    }
  }

  private async migrateStates(): Promise<void> {
    const existing = await this.db.query('SELECT * FROM company_states;', []);
    if (existing.rowCount === 0) {
      const toMigrate = await this.companyStateModel.find().lean();
      for (const s of toMigrate) {
        await this.db.query(
          'INSERT INTO company_states (company_id, peg, price, timestamp) VALUES ($1, $2, $3, $4);',
          [s.peg, c.symbol],
        );
      }
    }
  }
}
