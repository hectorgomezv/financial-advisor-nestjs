import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PositionDocument = PositionModel & Document;

@Schema({ collection: 'positions' })
export class PositionModel {
  @Prop({ required: true })
  uuid: string;

  @Prop({ required: true })
  portfolioUuid: string;

  @Prop({ required: true })
  targetWeight: number;

  @Prop({ required: true })
  shares: number;

  @Prop({ required: true })
  companyUuid: string;

  @Prop({ required: true })
  blocked: boolean;

  @Prop({ required: true })
  sharesUpdatedAt: Date;
}

export const PositionSchema = SchemaFactory.createForClass(PositionModel);
