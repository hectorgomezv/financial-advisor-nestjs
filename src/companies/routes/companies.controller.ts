import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
import _ from 'lodash';
import { User } from '../../common/auth/entities/user.entity.js';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard.js';
import { CreatedResponse } from '../../common/routes/entities/created-response.entity.js';
import { OkArrayResponse } from '../../common/routes/entities/ok-array-response.entity.js';
import { OkResponse } from '../../common/routes/entities/ok-response.entity.js';
import { MainExceptionFilter } from '../../common/routes/filters/main-exception.filter.js';
import { DataInterceptor } from '../../common/routes/interceptors/data.interceptor.js';
import { CompaniesService } from '../domain/companies.service.js';
import { CreateCompanyDto } from './dto/create-company.dto.js';
import { Company, CompanyWithState } from './entities/company.entity.js';
const { omit } = _;

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
  create(@Request() req, @Body() createCompanyDto: CreateCompanyDto) {
    return this.companiesService.create(req.user as User, createCompanyDto);
  }

  @Get()
  @OkArrayResponse(CompanyWithState)
  async findAll() {
    const companies = await this.companiesService.findAll();
    return companies.map((company) => ({
      ...company,
      state: omit(company.state, 'companyUuid'),
    }));
  }

  @Get(':uuid')
  @OkResponse(CompanyWithState)
  @ApiNotFoundResponse()
  async findOne(@Param('uuid') uuid: string) {
    const company = await this.companiesService.findOne(uuid);
    return {
      ...company,
      state: omit(company.state, 'companyUuid'),
    };
  }

  @Delete(':uuid')
  @OkResponse(Company)
  @ApiNotFoundResponse()
  remove(@Request() req, @Param('uuid') uuid: string) {
    return this.companiesService.remove(req.user as User, uuid);
  }
}
