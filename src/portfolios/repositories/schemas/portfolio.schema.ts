import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { PortfolioContribution } from '../../domain/entities/portfolio-contribution.entity.js';
import { PortfolioContributionSchema } from './portfolio-contribution.schema.js';

export type PortfolioDocument = PortfolioModel & Document;

@Schema({ collection: 'portfolios' })
export class PortfolioModel {
  @Prop({ type: String, required: true })
  uuid: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  ownerId: string;

  @Prop({ type: Date, required: true })
  created: Date;

  @Prop({ type: Number, required: true })
  cash: number;

  @Prop({ type: [PortfolioContributionSchema], default: [] })
  contributions: PortfolioContribution[];

  // Transient properties

  @Prop({ type: Number, required: false })
  contributionsCount: number;

  @Prop({ type: Number, required: false })
  contributionsSum: number;
}

export const PortfolioSchema = SchemaFactory.createForClass(PortfolioModel);
