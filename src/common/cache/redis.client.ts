import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisClient implements OnModuleDestroy {
  redis: Redis;

  constructor(private readonly configService: ConfigService) {
    this.redis = new Redis({
      username: 'default',
      password: configService.getOrThrow<string>('REDIS_PASSWORD'),
    });
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }
}
