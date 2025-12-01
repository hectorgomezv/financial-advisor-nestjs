import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Request,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User } from '../../common/auth/entities/user.entity';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { CreatedResponse } from '../../common/routes/entities/created-response.entity';
import { OkArrayResponse } from '../../common/routes/entities/ok-array-response.entity';
import { OkResponse } from '../../common/routes/entities/ok-response.entity';
import { MainExceptionFilter } from '../../common/routes/filters/main-exception.filter';
import { DataInterceptor } from '../../common/routes/interceptors/data.interceptor';
import { CompaniesService } from '../domain/companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import {
  Company,
  CompanyWithState,
  CompanyWithStateAndMetrics,
} from './entities/company.entity';
import { CompanyRouteMapper } from './mappers/company.route.mapper';

@UseInterceptors(DataInterceptor)
@UseFilters(MainExceptionFilter)
@ApiTags('companies')
@UseGuards(JwtAuthGuard)
@Controller({
  path: 'companies',
  version: '2',
})
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @CreatedResponse(CompanyWithState)
  @ApiBadRequestResponse()
  async create(
    @Request() req,
    @Body() createCompanyDto: CreateCompanyDto,
  ): Promise<CompanyWithState> {
    const result = await this.companiesService.create(
      req.user as User,
      createCompanyDto,
    );
    return CompanyRouteMapper.mapCompanyWithState(result);
  }

  @Get()
  @OkArrayResponse(CompanyWithStateAndMetrics)
  async getCompaniesWithMetricsAndState(): Promise<
    Array<CompanyWithStateAndMetrics>
  > {
    const result =
      await this.companiesService.getCompaniesWithStateAndMetrics();
    return result.map((company) =>
      CompanyRouteMapper.mapCompanyWithStateAndMetrics(company),
    );
  }

  @Get(':id')
  @OkResponse(CompanyWithStateAndMetrics)
  @ApiNotFoundResponse()
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CompanyWithStateAndMetrics> {
    const result = await this.companiesService.findById(id);
    return CompanyRouteMapper.mapCompanyWithStateAndMetrics(result);
  }

  @Delete(':id')
  @OkResponse(Company)
  @ApiNotFoundResponse()
  remove(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Company> {
    return this.companiesService.remove(req.user as User, id);
  }
}
