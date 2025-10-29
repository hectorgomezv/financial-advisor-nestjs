import { Module } from '@nestjs/common';
import { HealthService } from './domain/health.service.js';
import { HealthController } from './routes/health.controller.js';

@Module({
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
