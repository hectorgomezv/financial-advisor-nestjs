import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PositionDocument = PositionModel & Document;

@Schema({ collection: 'positions' })
export class PositionModel {
  @Prop({ type: String, required: true })
  uuid: string;

  @Prop({ type: String, required: true })
  portfolioUuid: string;

  @Prop({ type: Number, required: true })
  targetWeight: number;

  @Prop({ type: Number, required: true })
  shares: number;

  @Prop({ type: String, required: true })
  companyUuid: string;

  @Prop({ type: Boolean, required: true })
  blocked: boolean;

  @Prop({ type: Date, required: true })
  sharesUpdatedAt: Date;
}

export const PositionSchema = SchemaFactory.createForClass(PositionModel);
