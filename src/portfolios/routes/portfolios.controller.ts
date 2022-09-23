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
import { CreatePositionDto } from '../domain/dto/create-position.dto';
import { PortfoliosService } from '../domain/portfolios.service';
import { PositionsService } from '../domain/positions.service';

@UseInterceptors(DataInterceptor)
@UseFilters(MainExceptionFilter)
@Controller('portfolios')
export class PortfoliosController {
  constructor(
    private readonly portfoliosService: PortfoliosService,
    private readonly positionsService: PositionsService,
  ) {}

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
    return this.portfoliosService.deleteOne(uuid);
  }

  @Get(':uuid/metrics')
  getPortfolioMetrics(
    @Param('uuid') uuid: string,
    @Query('range') range?: string,
  ) {
    return this.portfoliosService.getMetrics(uuid, range);
  }

  @Post(':uuid/positions')
  addPosition(
    @Param('uuid') uuid: string,
    @Body() createPositionDto: CreatePositionDto,
  ) {
    return this.positionsService.create(uuid, createPositionDto);
  }
}
