import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PortfolioStateDocument = PortfolioStateModel & Document;

@Schema({ collection: 'portfolioStates' })
export class PortfolioStateModel {
  @Prop({ required: true })
  uuid: string;

  @Prop({ required: true })
  timestamp: Date;

  @Prop({ required: true })
  portfolioUuid: string;

  @Prop({ required: true })
  isValid: boolean;

  @Prop({ required: true })
  sumWeights: number;

  @Prop({ required: true })
  totalValueEUR: number;
}

export const PortfolioStateSchema =
  SchemaFactory.createForClass(PortfolioStateModel);
