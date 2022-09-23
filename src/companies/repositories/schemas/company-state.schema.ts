import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CompanyStateDocument = CompanyStateModel & Document;

@Schema({ collection: 'companyStates' })
export class CompanyStateModel {
  @Prop({ required: true })
  uuid: string;

  @Prop({ required: true })
  timestamp: number;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  peg: number;

  @Prop({ required: true })
  companyUuid: string;
}

export const CompanyStateSchema =
  SchemaFactory.createForClass(CompanyStateModel);
