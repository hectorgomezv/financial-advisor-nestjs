import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';

type QueryArg = string | number | boolean | Date | null | Array<number>;

@Injectable()
export class DbService implements OnModuleDestroy {
  private readonly pool: Pool;

  constructor(private configService: ConfigService) {
    this.pool = new Pool({
      user: this.configService.getOrThrow<string>('POSTGRES_USER'),
      password: this.configService.getOrThrow<string>('POSTGRES_PASSWORD'),
      database: this.configService.getOrThrow<string>('POSTGRES_DB'),
      host: this.configService.getOrThrow<string>('POSTGRES_HOST'),
      port: this.configService.get<number>('POSTGRES_PORT') || 5432,
    });
  }

  onModuleDestroy() {
    this.pool.end();
  }

  async query<T extends QueryResultRow>(
    sql: string,
    args: Array<QueryArg>,
  ): Promise<QueryResult<T>> {
    return this.pool.query<T>(sql, args);
  }

  async runTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN;');
      const result = await fn(client);
      await client.query('COMMIT;');
      return result;
    } catch (err) {
      await client.query('ROLLBACK;');
      throw err;
    } finally {
      await client.release();
    }
  }
}
