import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import {
  DataPointModel,
  DataPointSchema,
} from './domain/schemas/data-point.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DataPointModel.name, schema: DataPointSchema },
    ]),
    ConfigModule,
    HttpModule,
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class CommonModule {}
