import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
export class CompanyMetricsSchema {
  @Prop({ type: Number, required: true })
  avgEnterpriseToRevenue: number;

  @Prop({ type: Number, required: true })
  avgEnterpriseToEbitda: number;

  @Prop({ type: Number, required: true })
  avgForwardPE: number;

  @Prop({ type: Number, required: true })
  avgProfitMargins: number;
}
