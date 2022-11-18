import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PortfolioContributionDocument = PortfolioContributionModel &
  Document;

@Schema()
export class PortfolioContributionModel {
  @Prop({ required: true })
  uuid: string;

  @Prop({ required: true })
  timestamp: Date;

  @Prop({ required: true })
  amountEUR: number;
}

export const PortfolioContributionSchema = SchemaFactory.createForClass(
  PortfolioContributionModel,
);
