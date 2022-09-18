import { Module } from '@nestjs/common';
import { HealthService } from './domain/health.service';
import { HealthController } from './routes/health.controller';

@Module({
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
