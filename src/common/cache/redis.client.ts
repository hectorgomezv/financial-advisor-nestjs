import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as ioredis from 'ioredis';

@Injectable()
export class RedisClient implements OnModuleDestroy {
  redis: ioredis.Redis;

  constructor(private readonly configService: ConfigService) {
    const connectionString = configService.get<string>(
      'REDIS_CONNECTION_STRING',
    );

    if (connectionString) {
      this.redis = new ioredis.Redis(connectionString);
    } else {
      this.redis = new ioredis.Redis({
        username: 'default',
        password: configService.getOrThrow<string>('REDIS_PASSWORD'),
      });
    }
  }

  async onModuleDestroy() {
    await this.redis.flushall();
    await this.redis.quit();
  }
}
