import { Module } from '@nestjs/common';
import { MetricsService } from './domain/metrics.service';
import { MetricsController } from './routes/metrics.controller';

@Module({
  controllers: [MetricsController],
  providers: [MetricsService],
})
export class MetricsModule {}
