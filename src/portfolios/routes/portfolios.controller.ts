import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseInterceptors,
  UseFilters,
  Query,
} from '@nestjs/common';
import { MainExceptionFilter } from '../../common/routes/filters/main-exception.filter';
import { DataInterceptor } from '../../common/routes/interceptors/data.interceptor';
import { CreatePortfolioDto } from '../domain/dto/create-portfolio.dto';
import { PortfoliosService } from '../domain/portfolios.service';

@UseInterceptors(DataInterceptor)
@UseFilters(MainExceptionFilter)
@Controller('portfolios')
export class PortfoliosController {
  constructor(private readonly portfoliosService: PortfoliosService) {}

  @Post()
  create(@Body() createPortfolioDto: CreatePortfolioDto) {
    return this.portfoliosService.create(createPortfolioDto);
  }

  @Get()
  findAll() {
    return this.portfoliosService.findAll();
  }

  @Get(':uuid')
  findOne(@Param('uuid') uuid: string) {
    return this.portfoliosService.findOne(uuid);
  }

  @Delete(':uuid')
  remove(@Param('uuid') uuid: string) {
    return this.portfoliosService.remove(uuid);
  }

  @Get(':uuid/metrics')
  getPortfolioMetrics(
    @Param('uuid') uuid: string,
    @Query('range') range?: string,
  ) {
    return this.portfoliosService.getMetrics(uuid, range);
  }
}
