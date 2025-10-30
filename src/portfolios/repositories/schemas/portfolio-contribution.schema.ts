import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PortfolioContributionDocument = PortfolioContributionModel &
  Document;

@Schema()
export class PortfolioContributionModel {
  @Prop({ type: String, required: true })
  uuid: string;

  @Prop({ type: Date, required: true })
  timestamp: Date;

  @Prop({ type: Number, required: true })
  amountEUR: number;
}

export const PortfolioContributionSchema = SchemaFactory.createForClass(
  PortfolioContributionModel,
);
