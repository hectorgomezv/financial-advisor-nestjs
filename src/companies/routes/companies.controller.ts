import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseInterceptors,
  UseFilters,
} from '@nestjs/common';
import { MainExceptionFilter } from '../../common/routes/filters/main-exception.filter';
import { DataInterceptor } from '../../common/routes/interceptors/data.interceptor';
import { CompaniesService } from '../domain/companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';

@UseInterceptors(DataInterceptor)
@UseFilters(MainExceptionFilter)
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companiesService.create(createCompanyDto);
  }

  @Get()
  findAll() {
    return this.companiesService.findAll();
  }

  @Get(':uuid')
  findOne(@Param('uuid') uuid: string) {
    return this.companiesService.findOne(uuid);
  }

  @Delete(':uuid')
  remove(@Param('uuid') uuid: string) {
    return this.companiesService.remove(uuid);
  }
}
