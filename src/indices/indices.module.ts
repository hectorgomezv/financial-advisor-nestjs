import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from '../common/auth/auth-service';
import { DbModule } from '../common/db.module';
import { IFinancialDataClient } from '../companies/datasources/financial-data.client.interface';
import { YahooFinancialDataClient } from '../companies/datasources/yahoo-financial-data.client';
import { IndicesService } from './domain/indices.service';
import { IndicesRepository } from './repositories/indices.repository';
import { IndicesController } from './routes/indices.controller';

@Module({
  imports: [ConfigModule, DbModule, HttpModule],
  controllers: [IndicesController],
  providers: [
    { provide: IFinancialDataClient, useClass: YahooFinancialDataClient },
    AuthService,
    IndicesService,
    IndicesRepository,
  ],
  exports: [IndicesService, IndicesRepository],
})
export class IndicesModule {}
