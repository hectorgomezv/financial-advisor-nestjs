import { Controller, Get } from '@nestjs/common';
import { MetricsService } from '../domain/metrics.service';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  getAll() {
    return this.metricsService.getMetrics();
  }
}
