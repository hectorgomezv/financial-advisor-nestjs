import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from '../common/auth/auth-service.js';
import { IFinancialDataClient } from '../companies/datasources/financial-data.client.interface.js';
import { YahooFinancialDataClient } from '../companies/datasources/yahoo-financial-data.client.js';
import { IndicesService } from './domain/indices.service.js';
import { IndicesRepository } from './repositories/indices.repository.js';
import {
  IndexModel,
  IndexSchema,
} from './repositories/schemas/index.schema.js';
import { IndicesController } from './routes/indices.controller.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: IndexModel.name, schema: IndexSchema }]),
    ConfigModule,
    HttpModule,
  ],
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
