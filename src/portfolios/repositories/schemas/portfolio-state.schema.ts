import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PortfolioStateDocument = PortfolioStateModel & Document;

@Schema({ collection: 'portfolioStates' })
export class PortfolioStateModel {
  @Prop({ type: String, required: true })
  uuid: string;

  @Prop({ type: Date, required: true })
  timestamp: Date;

  @Prop({ type: String, required: true })
  portfolioUuid: string;

  @Prop({ type: Boolean, required: true })
  isValid: boolean;

  @Prop({ type: Number, required: true })
  sumWeights: number;

  @Prop({ type: Number, required: true })
  cash: number;

  @Prop({ type: Number, required: true })
  roicEUR: number;

  @Prop({ type: Number, required: true })
  totalValueEUR: number;
}

export const PortfolioStateSchema =
  SchemaFactory.createForClass(PortfolioStateModel);
