import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CompanyDocument = CompanyModel & Document;

@Schema()
export class CompanyModel {
  @Prop({ required: true })
  uuid: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  symbol: string;
}

export const CompanySchema = SchemaFactory.createForClass(CompanyModel);
