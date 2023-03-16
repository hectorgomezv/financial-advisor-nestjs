import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { PortfolioContribution } from '../../domain/entities/portfolio-contribution.entity';
import { PortfolioContributionSchema } from './portfolio-contribution.schema';

export type PortfolioDocument = PortfolioModel & Document;

@Schema({ collection: 'portfolios' })
export class PortfolioModel {
  @Prop({ required: true })
  uuid: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  ownerId: string;

  @Prop({ required: true })
  created: number;

  @Prop({ required: true })
  cash: number;

  @Prop({ required: true, schema: PortfolioContributionSchema })
  contributions: PortfolioContribution[];

  // Transient properties

  @Prop({ required: false })
  contributionsCount: number;

  @Prop({ required: false })
  contributionsSum: number;
}

export const PortfolioSchema = SchemaFactory.createForClass(PortfolioModel);
