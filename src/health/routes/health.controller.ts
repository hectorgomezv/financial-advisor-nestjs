import { Controller, Get, UseFilters, UseInterceptors } from '@nestjs/common';
import { MainExceptionFilter } from '../../common/routes/filters/main-exception.filter';
import { DataInterceptor } from '../../common/routes/interceptors/data.interceptor';
import { HealthService } from '../domain/health.service';

@UseInterceptors(DataInterceptor)
@UseFilters(MainExceptionFilter)
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  findOne() {
    return this.healthService.findOne();
  }
}
