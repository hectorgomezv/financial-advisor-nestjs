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
}

export const PortfolioSchema = SchemaFactory.createForClass(PortfolioModel);
