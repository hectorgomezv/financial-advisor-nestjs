import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { sub } from 'date-fns';
import { Model } from 'mongoose';
import { from } from '../../common/cache/cache.key.mapper.js';
import { RedisClient } from '../../common/cache/redis.client.js';
import { CompanyMetrics } from '../domain/entities/company-metrics.entity.js';
import { CompanyState } from '../domain/entities/company-state.entity.js';
import {
  CompanyStateDocument,
  CompanyStateModel,
} from './schemas/company-state.schema.js';

@Injectable()
export class CompanyStatesRepository {
  private readonly logger = new Logger(CompanyStatesRepository.name);
  private lastStateKey = 'company_last_state';

  constructor(
    @InjectModel(CompanyStateModel.name)
    private model: Model<CompanyStateDocument>,
    private readonly redisClient: RedisClient,
  ) {}

  async create(companyState: CompanyState): Promise<CompanyState> {
    this.redisClient.redis.del(this.lastStateKey);
    this.logger.debug(`Key ${this.lastStateKey} deleted from cache`);
    const created = (await this.model.create(companyState)).toObject();
    const result = plainToInstance(CompanyState, created, {
      excludePrefixes: ['_', '__'],
    });
    return result;
  }

  async deleteByCompanyUuid(companyUuid: string): Promise<void> {
    this.redisClient.redis.del(this.lastStateKey);
    this.logger.debug(`Key ${this.lastStateKey} deleted from cache`);
    await this.model.deleteMany({ companyUuid });
  }

  async getLastByCompanyUuid(companyUuid: string): Promise<CompanyState> {
    const cached = await this.redisClient.redis.hget(
      this.lastStateKey,
      companyUuid,
    );

    if (cached) {
      this.logger.debug(
        `Key ${this.lastStateKey}:${companyUuid} read from cache`,
      );
      return JSON.parse(cached);
    }

    const lastState = await this.model
      .findOne({ companyUuid })
      .sort({ timestamp: -1 })
      .limit(1)
      .lean();

    const result = plainToInstance(CompanyState, lastState, {
      excludePrefixes: ['_', '__'],
    });

    await this.redisClient.redis.hset(
      this.lastStateKey,
      companyUuid,
      JSON.stringify(result),
    );
    this.logger.debug(`Key ${this.lastStateKey}:${companyUuid} set in cache`);
    return result;
  }

  async getLastByCompanyUuids(companyUuids: string[]): Promise<CompanyState[]> {
    const hash = from(companyUuids.sort());
    const cached = await this.redisClient.redis.hget(this.lastStateKey, hash);

    if (cached) {
      this.logger.debug(`Key ${this.lastStateKey}:${hash} read from cache`);
      return JSON.parse(cached);
    }

    const states = await this.model
      .aggregate()
      .match({ companyUuid: { $in: companyUuids } })
      .group({ _id: '$companyUuid', state: { $last: '$$ROOT' } })
      .lookup({
        from: 'companies',
        localField: '_id',
        foreignField: 'uuid',
        as: 'company',
      })
      .exec();

    const result = plainToInstance(
      CompanyState,
      states.map((i) => i.state),
      { excludePrefixes: ['_', '__'] },
    );

    this.redisClient.redis.hset(
      this.lastStateKey,
      hash,
      JSON.stringify(result),
    );
    this.logger.debug(`Key ${this.lastStateKey}:${hash} set in cache`);
    return result;
  }

  /**
   * Gets {@link CompanyMetrics} for the last year.
   */
  async getMetricsByCompanyUuid(companyUuid: string): Promise<CompanyMetrics> {
    const metrics = await this.model
      .aggregate()
      .match({
        companyUuid,
        timestamp: { $gte: sub(new Date(), { years: 1 }) },
        enterpriseToRevenue: { $ne: NaN, $gt: 0, $exists: true },
        enterpriseToEbitda: { $ne: NaN, $exists: true },
        forwardPE: { $ne: NaN, $gt: 0, $exists: true },
        profitMargins: { $ne: NaN, $exists: true },
      })
      .group({
        _id: '$companyUuid',
        avgEnterpriseToRevenue: { $avg: '$enterpriseToRevenue' },
        avgEnterpriseToEbitda: { $avg: '$enterpriseToEbitda' },
        avgForwardPE: { $avg: '$forwardPE' },
        avgProfitMargins: { $avg: '$profitMargins' },
      })
      .exec();

    return plainToInstance(CompanyMetrics, metrics[0], {
      excludePrefixes: ['_', '__'],
    });
  }
}
