import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type DataPointDocument = DataPointModel & Document;

@Schema({ autoCreate: false })
export class DataPointModel {
  @Prop({ type: Number, required: true })
  timestamp: number;

  @Prop({ type: Number, required: true })
  value: number;
}

export const DataPointSchema = SchemaFactory.createForClass(DataPointModel);
