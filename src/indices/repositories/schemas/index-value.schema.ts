import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type IndexValueDocument = IndexValueModel & Document;

@Schema()
export class IndexValueModel {
  @Prop({ required: true })
  timestamp: number;

  @Prop({ required: true })
  value: number;
}

export const IndexValueSchema = SchemaFactory.createForClass(IndexValueModel);
