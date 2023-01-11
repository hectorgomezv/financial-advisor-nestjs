import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IndexValue } from '../../domain/entities/index.entity';
import { IndexValueSchema } from './index-value.schema';

export type IndexDocument = IndexModel & Document;

@Schema({ collection: 'indices' })
export class IndexModel {
  @Prop({ required: true })
  uuid: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  symbol: string;

  @Prop({ required: true, schema: IndexValueSchema })
  values: IndexValue[];
}

export const IndexSchema = SchemaFactory.createForClass(IndexModel);
