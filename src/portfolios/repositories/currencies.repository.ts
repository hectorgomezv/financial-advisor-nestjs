import { Injectable } from '@nestjs/common';
import { DbService } from '../../common/db.service';
import Decimal from 'decimal.js';
import { wrapDatabaseOperation } from '../../common/db/wrap-database-operation';

interface DbRate {
  symbol: string;
  usd_value: string;
}

@Injectable()
export class CurrenciesRepository {
  constructor(private readonly db: DbService) {}

  async getRates(): Promise<Array<{ symbol: string; usdValue: Decimal }>> {
    return wrapDatabaseOperation(async () => {
      const query = `SELECT symbol, usd_value FROM currencies;`;
      const { rows } = await this.db.query<DbRate>(query, []);
      return rows.map((row) => ({
        symbol: row.symbol,
        usdValue: new Decimal(row.usd_value),
      }));
    });
  }

  async upsertRate(symbol: string, usdValue: Decimal): Promise<void> {
    return wrapDatabaseOperation(async () => {
      const query = `
        INSERT INTO currencies (symbol, usd_value)
        VALUES ($1, ROUND($2::NUMERIC, 6))
        ON CONFLICT (symbol)
        DO UPDATE SET usd_value = ROUND($2::NUMERIC, 6);`;
      await this.db.query(query, [symbol, usdValue.toString()]);
    });
  }
}
