export class UpsertPositionDto {
  symbol: string;
  targetWeight: number;
  shares: number;
  blocked: boolean;
}
