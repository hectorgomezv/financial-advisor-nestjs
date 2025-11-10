import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { DataPoint } from '../../../common/domain/entities/data-point.entity';
import { DataPointSchema } from '../../../common/domain/schemas/data-point.schema';

// TODO: Remove after db migration

export type IndexDocument = IndexModel & Document;

@Schema({ collection: 'indices' })
export class IndexModel {
  @Prop({ required: true })
  uuid: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  symbol: string;

  @Prop({ required: true, schema: DataPointSchema })
  values: DataPoint[];
}

export const IndexSchema = SchemaFactory.createForClass(IndexModel);
