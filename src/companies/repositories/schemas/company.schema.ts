import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { CompanyMetrics } from '../../domain/entities/company-metrics.entity';
import { CompanyMetricsSchema } from './company-metrics.schema';

export type CompanyDocument = CompanyModel & Document;

@Schema({ collection: 'companies' })
export class CompanyModel {
  @Prop({ required: true })
  uuid: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  symbol: string;

  @Prop({ required: true, schema: CompanyMetricsSchema })
  metrics: CompanyMetrics;
}

export const CompanySchema = SchemaFactory.createForClass(CompanyModel);
