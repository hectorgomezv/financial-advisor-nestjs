import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
export class CompanyMetricsSchema {
  @Prop({ required: true })
  avgEnterpriseToRevenue: number;

  @Prop({ required: true })
  avgEnterpriseToEbitda: number;

  @Prop({ required: true })
  avgPeg: number;
}
