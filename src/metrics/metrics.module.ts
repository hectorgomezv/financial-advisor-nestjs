import { Module } from '@nestjs/common';
import { MetricsService } from './domain/metrics.service.js';
import { MetricsController } from './routes/metrics.controller.js';

@Module({
  controllers: [MetricsController],
  providers: [MetricsService],
})
export class MetricsModule {}
