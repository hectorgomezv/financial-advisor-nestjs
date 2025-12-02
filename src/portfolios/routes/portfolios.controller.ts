import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Request,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { User } from '../../common/auth/entities/user.entity';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { TimePeriod } from '../../common/domain/entities/time-period.entity';
import { CreatedResponse } from '../../common/routes/entities/created-response.entity';
import { DataPoint } from '../../common/routes/entities/data-point.entity';
import { OkArrayResponse } from '../../common/routes/entities/ok-array-response.entity';
import { OkResponse } from '../../common/routes/entities/ok-response.entity';
import { MainExceptionFilter } from '../../common/routes/filters/main-exception.filter';
import { DataInterceptor } from '../../common/routes/interceptors/data.interceptor';
import {
  getRangeStartTimestamp,
  timeRangeFromStr,
} from '../domain/entities/time-range.enum';
import { PortfoliosService } from '../domain/portfolios.service';
import { PositionsService } from '../domain/positions.service';
import { AddPortfolioContributionDto } from './dto/add-portfolio-contribution.dto';
import { ContributionsPage } from './dto/contributions-page.dto';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioCashDto } from './dto/update-portfolio-cash.dto';
import { UpsertPositionDto } from './dto/upsert-position.dto';
import { PortfolioAverageMetric as PortfolioAverageBalance } from './entities/portfolio-average-balance.entity';
import { Portfolio } from './entities/portfolio.entity';
import { Position } from './entities/position.entity';
import Decimal from 'decimal.js';
import { PortfolioRouteMapper } from './mappers/portfolio.route.mapper';
import { PortfolioWithContributions } from './entities/portfolio-with-contributions.entity';
import { PortfolioWithPositionsAndState } from './entities/portfolio-with-positions-and-state.entity copy';

@UseInterceptors(DataInterceptor)
@UseFilters(MainExceptionFilter)
@ApiTags('portfolios')
@UseGuards(JwtAuthGuard)
@Controller({
  path: 'portfolios',
  version: '2',
})
export class PortfoliosController {
  constructor(
    private readonly portfoliosService: PortfoliosService,
    private readonly positionsService: PositionsService,
  ) {}

  @Post()
  @CreatedResponse(Portfolio)
  @ApiBadRequestResponse()
  async create(
    @Request() req,
    @Body() createPortfolioDto: CreatePortfolioDto,
  ): Promise<Portfolio> {
    const result = await this.portfoliosService.create(
      req.user as User,
      createPortfolioDto,
    );
    return PortfolioRouteMapper.mapPortfolio(result);
  }

  @Get()
  @OkArrayResponse(PortfolioWithContributions)
  async findAll(@Request() req): Promise<Array<PortfolioWithContributions>> {
    const result = await this.portfoliosService.findByOwnerId(req.user as User);
    return result.map((p) =>
      PortfolioRouteMapper.mapPortfolioWithContributions(p),
    );
  }

  @Get(':id')
  @OkResponse(PortfolioWithPositionsAndState)
  @ApiNotFoundResponse()
  async findOne(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PortfolioWithPositionsAndState> {
    const result = await this.portfoliosService.findById(req.user as User, id);
    return PortfolioRouteMapper.mapPortfolioWithPositionsAndState(result);
  }

  @Delete(':id')
  @ApiNotFoundResponse()
  @OkResponse(Portfolio)
  remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.portfoliosService.deleteOne(req.user as User, id);
  }

  @Get(':id/metrics/average-balances')
  @OkArrayResponse(PortfolioAverageBalance)
  @ApiNotFoundResponse()
  @ApiQuery({ name: 'range', type: String, required: false })
  async getPortfolioMetrics(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Query('range', new DefaultValuePipe('week')) range: string,
  ): Promise<Array<PortfolioAverageBalance>> {
    const res = await this.portfoliosService.getAverageBalances(
      req.user as User,
      id,
      range,
    );
    return res.map((pav) => ({
      timestamp: pav.timestamp,
      average: pav.average.toString(),
      contributions: pav.contributions.toString(),
    }));
  }

  @Get(':id/metrics/performance')
  @OkArrayResponse(DataPoint)
  @ApiNotFoundResponse()
  @ApiQuery({ name: 'range', type: String, required: false })
  getPerformance(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Query('range', new DefaultValuePipe('week')) range: string,
  ): Promise<DataPoint[]> {
    return this.portfoliosService.getPerformance(req.user as User, id, range);
  }

  @Get(':id/metrics/performance/returns')
  @OkArrayResponse(DataPoint)
  @ApiNotFoundResponse()
  @ApiQuery({ name: 'range', type: String, required: false })
  getReturnRates(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Query('range', new DefaultValuePipe('week')) range: string,
  ): Promise<DataPoint[]> {
    return this.portfoliosService.getReturnRates(
      req.user as User,
      id,
      TimePeriod.from(
        getRangeStartTimestamp(timeRangeFromStr(range)),
        new Date(),
      ),
    );
  }

  @Post(':id/positions')
  @CreatedResponse(Position)
  @ApiBadRequestResponse()
  addPosition(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() upsertPositionDto: UpsertPositionDto,
  ) {
    return this.positionsService.create(req.user as User, id, {
      symbol: upsertPositionDto.symbol,
      targetWeight: new Decimal(upsertPositionDto.targetWeight),
      shares: new Decimal(upsertPositionDto.shares),
      blocked: upsertPositionDto.blocked,
    });
  }

  @Put(':id/positions')
  @OkResponse(Position)
  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  updatePosition(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() upsertPositionDto: UpsertPositionDto,
  ) {
    return this.positionsService.update(req.user as User, id, {
      symbol: upsertPositionDto.symbol,
      targetWeight: new Decimal(upsertPositionDto.targetWeight),
      shares: new Decimal(upsertPositionDto.shares),
      blocked: upsertPositionDto.blocked,
    });
  }

  @Put(':id/cash')
  @OkResponse(Portfolio)
  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  updatePortfolioCash(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePortfolioCash: UpdatePortfolioCashDto,
  ) {
    return this.portfoliosService.updateCash(req.user as User, id, {
      cash: new Decimal(updatePortfolioCash.cash),
    });
  }

  @Get(':id/contributions')
  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  @OkResponse(ContributionsPage)
  @ApiQuery({ name: 'offset', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  async getContributions(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Query(
      'offset',
      new DefaultValuePipe(PortfoliosService.DEFAULT_OFFSET),
      ParseIntPipe,
    )
    offset: number,
    @Query(
      'limit',
      new DefaultValuePipe(PortfoliosService.DEFAULT_LIMIT),
      ParseIntPipe,
    )
    limit: number,
  ): Promise<ContributionsPage> {
    const contributionsMetadata =
      await this.portfoliosService.getContributionsMetadata(
        req.user as User,
        id,
      );
    const contributions = await this.portfoliosService.getContributions(
      req.user as User,
      id,
      offset,
      limit,
    );

    return {
      portfolioId: id,
      count: contributionsMetadata.count,
      sum: contributionsMetadata.sum.toString(),
      offset,
      limit,
      items: contributions.map((c) => PortfolioRouteMapper.mapContribution(c)),
    };
  }

  @Post(':id/contributions')
  @CreatedResponse(Portfolio)
  @ApiBadRequestResponse()
  addContribution(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() addPortfolioContributionDto: AddPortfolioContributionDto,
  ) {
    return this.portfoliosService.addContribution(
      req.user as User,
      id,
      addPortfolioContributionDto,
    );
  }

  @Delete(':id/contributions/:contributionId')
  @CreatedResponse(Portfolio)
  @ApiBadRequestResponse()
  deleteContribution(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Param('contributionId') contributionId: number,
  ) {
    return this.portfoliosService.deleteContribution(
      req.user as User,
      id,
      contributionId,
    );
  }

  @Delete(':id/positions/:positionId')
  @OkResponse(Position)
  @ApiNotFoundResponse()
  deletePosition(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Param('positionId') positionId: number,
  ) {
    return this.positionsService.deleteByIdAndPortfolioId(
      req.user as User,
      id,
      positionId,
    );
  }
}
