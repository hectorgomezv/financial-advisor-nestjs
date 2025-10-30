import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { DataPoint } from '../../../common/domain/entities/data-point.entity.js';
import { DataPointSchema } from '../../../common/domain/schemas/data-point.schema.js';

export type IndexDocument = IndexModel & Document;

@Schema({ collection: 'indices' })
export class IndexModel {
  @Prop({ type: String, required: true })
  uuid: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  symbol: string;

  @Prop({ type: Array, required: true, schema: DataPointSchema })
  values: DataPoint[];
}

export const IndexSchema = SchemaFactory.createForClass(IndexModel);
