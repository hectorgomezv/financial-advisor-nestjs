import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CompanyStateDocument = CompanyStateModel & Document;

@Schema({ collection: 'companyStates' })
export class CompanyStateModel {
  @Prop({ type: String, required: true })
  uuid: string;

  @Prop({ type: String, required: true })
  companyUuid: string;

  @Prop({ type: Date, required: true })
  timestamp: Date;

  @Prop({ type: Number, required: true })
  price: number;

  @Prop({ type: String, required: true })
  currency: string;

  @Prop({ type: Number, required: true })
  forwardPE: number;

  @Prop({ type: Number, required: true })
  profitMargins: number;

  @Prop({ type: Number, required: true })
  enterpriseToRevenue: number;

  @Prop({ type: Number, required: true })
  enterpriseToEbitda: number;

  @Prop({ type: Number, required: true })
  shortPercentOfFloat: number;
}

export const CompanyStateSchema =
  SchemaFactory.createForClass(CompanyStateModel);
