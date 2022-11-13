import { Controller, Get, UseFilters, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { OkResponse } from '../../common/routes/entities/ok-response.entity';
import { MainExceptionFilter } from '../../common/routes/filters/main-exception.filter';
import { DataInterceptor } from '../../common/routes/interceptors/data.interceptor';
import { AboutService } from '../domain/about.service';
import { About } from './entities/about.entity';

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
