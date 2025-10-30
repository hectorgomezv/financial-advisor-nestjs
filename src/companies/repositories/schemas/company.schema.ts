import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { CompanyMetrics } from '../../domain/entities/company-metrics.entity.js';
import { CompanyMetricsSchema } from './company-metrics.schema.js';

export type CompanyDocument = CompanyModel & Document;

@Schema({ collection: 'companies' })
export class CompanyModel {
  @Prop({ type: String, required: true })
  uuid: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  symbol: string;

  @Prop({ type: Object, required: true, schema: CompanyMetricsSchema })
  metrics: CompanyMetrics;
}

export const CompanySchema = SchemaFactory.createForClass(CompanyModel);
