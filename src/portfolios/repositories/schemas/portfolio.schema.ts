import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PortfolioDocument = PortfolioModel & Document;

@Schema({ collection: 'portfolios' })
export class PortfolioModel {
  @Prop({ required: true })
  uuid: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  created: number;

  @Prop({ required: true })
  seed: number;

  @Prop({ required: true })
  cash: number;

  @Prop({ required: true })
  contributions: [];
}

export const PortfolioSchema = SchemaFactory.createForClass(PortfolioModel);
