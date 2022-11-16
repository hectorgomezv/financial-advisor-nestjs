import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Put,
  Query,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { CreatedResponse } from '../../common/routes/entities/created-response.entity';
import { OkArrayResponse } from '../../common/routes/entities/ok-array-response.entity';
import { OkResponse } from '../../common/routes/entities/ok-response.entity';
import { MainExceptionFilter } from '../../common/routes/filters/main-exception.filter';
import { DataInterceptor } from '../../common/routes/interceptors/data.interceptor';
import { PortfoliosService } from '../domain/portfolios.service';
import { PositionsService } from '../domain/positions.service';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpsertPositionDto } from './dto/upsert-position.dto';
import { PortfolioAverageMetric as PortfolioAverageBalance } from './entities/portfolio-average-balance.entity';
import { Portfolio } from './entities/portfolio.entity';
import { Position } from './entities/position.entity';

@UseInterceptors(DataInterceptor)
@UseFilters(MainExceptionFilter)
@ApiTags('portfolios')
@UseGuards(JwtAuthGuard)
@Controller({
  path: 'portfolios',
  version: '2',
})
export class PortfoliosController {
  private readonly logger = new Logger(PortfoliosController.name);

  constructor(
    private readonly portfoliosService: PortfoliosService,
    private readonly positionsService: PositionsService,
  ) {}

  @Post()
  @CreatedResponse(Portfolio)
  @ApiBadRequestResponse()
  create(@Body() createPortfolioDto: CreatePortfolioDto) {
    return this.portfoliosService.create(createPortfolioDto);
  }

  @Get()
  @OkArrayResponse(Portfolio)
  findAll() {
    return this.portfoliosService.findAll();
  }

  @Get(':uuid')
  @OkResponse(Portfolio)
  @ApiNotFoundResponse()
  findOne(@Param('uuid') uuid: string) {
    return this.portfoliosService.findOne(uuid);
  }

  @Delete(':uuid')
  @ApiNotFoundResponse()
  @OkResponse(Portfolio)
  remove(@Param('uuid') uuid: string) {
    return this.portfoliosService.deleteOne(uuid);
  }

  @Get(':uuid/metrics/average-balances')
  @OkArrayResponse(PortfolioAverageBalance)
  @ApiNotFoundResponse()
  getPortfolioMetrics(
    @Param('uuid') uuid: string,
    @Query('range') range?: string,
  ) {
    return this.portfoliosService.getAverageBalances(uuid, range);
  }

  @Post(':uuid/positions')
  @CreatedResponse(Position)
  @ApiBadRequestResponse()
  addPosition(
    @Param('uuid') uuid: string,
    @Body() upsertPositionDto: UpsertPositionDto,
  ) {
    return this.positionsService.create(uuid, upsertPositionDto);
  }

  @Put(':uuid/positions')
  @OkResponse(Position)
  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  updatePosition(
    @Param('uuid') uuid: string,
    @Body() upsertPositionDto: UpsertPositionDto,
  ) {
    return this.positionsService.update(uuid, upsertPositionDto);
  }

  @Delete(':uuid/positions/:positionUuid')
  @OkResponse(Position)
  @ApiNotFoundResponse()
  deletePosition(
    @Param('uuid') uuid: string,
    @Param('positionUuid') positionUuid: string,
  ) {
    return this.positionsService.deleteByUuidAndPortfolioUuid(
      uuid,
      positionUuid,
    );
  }
}
