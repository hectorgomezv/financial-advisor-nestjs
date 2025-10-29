import { Controller, Get, UseFilters, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { OkResponse } from '../../common/routes/entities/ok-response.entity.js';
import { MainExceptionFilter } from '../../common/routes/filters/main-exception.filter.js';
import { DataInterceptor } from '../../common/routes/interceptors/data.interceptor.js';
import { AboutService } from '../domain/about.service.js';
import { About } from './entities/about.entity.js';

@UseInterceptors(DataInterceptor)
@UseFilters(MainExceptionFilter)
@ApiTags('about')
@Controller({
  path: 'about',
  version: '2',
})
export class AboutController {
  constructor(private readonly service: AboutService) {}

  @Get()
  @OkResponse(About)
  getAbout(): About {
    return this.service.getAbout();
  }
}
