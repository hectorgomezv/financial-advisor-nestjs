import { Injectable } from '@nestjs/common';
import { Index } from '../domain/entities/index.entity';
import { DbService } from '../../common/db.service';
import { DataPoint } from '../../common/domain/entities/data-point.entity';

export interface DbIndex {
  id: number;
  name: string;
  symbol: string;
}

export interface DbIndexState {
  timestamp: Date;
  value: string;
}

@Injectable()
export class IndicesRepository {
  constructor(private readonly db: DbService) {}

  // TODO: refactor using a JOIN to avoid N trips to the DB
  // const query = `select i.name, i.symbol, s.timestamp from indices i left join index_states s on i.id = s.index_id;`
  async findAll(): Promise<Array<Index>> {
    const result: Array<Index> = [];
    const { rows } = await this.db.query<DbIndex>(
      `SELECT id, name, symbol FROM indices;`,
      [],
    );
    for (const index of rows) {
      const { rows } = await this.db.query<DbIndexState>(
        `SELECT timestamp, value FROM index_states WHERE index_id = $1`,
        [index.id],
      );
      result.push({
        id: index.id,
        name: index.name,
        symbol: index.symbol,
        values: rows.map((r) => ({
          timestamp: r.timestamp,
          value: Number(r.value),
        })),
      });
    }
    return result;
  }

  async persistDataPoints(id: number, dataPoints: DataPoint[]): Promise<void> {
    await this.db.runTransaction(async (client) => {
      await client.query(`DELETE FROM index_states WHERE index_id = $1`, [id]);
      for (const dataPoint of dataPoints) {
        // TODO: bulk insert
        await client.query(
          `INSERT INTO index_states (index_id, timestamp, value) VALUES ($1, $2, $3)`,
          [id, dataPoint.timestamp, dataPoint.value],
        );
      }
    });
  }

  async getIndexValuesFrom(id: number, timestamp: Date): Promise<DataPoint[]> {
    const { rows } = await this.db.query<{ timestamp: Date; value: string }>(
      `SELECT timestamp, value FROM index_states WHERE index_id = $1 AND timestamp > $2::TIMESTAMP;`,
      [id, timestamp],
    );
    return rows.map((r) => ({
      timestamp: r.timestamp,
      value: Number(r.value),
    }));
  }
}
