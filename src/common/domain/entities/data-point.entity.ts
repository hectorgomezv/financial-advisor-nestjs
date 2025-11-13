export class DataPoint {
  // TODO: migrate from number to Decimal
  timestamp: Date;
  value: number;

  constructor(timestamp: Date, value: number) {
    this.timestamp = timestamp;
    this.value = value;
  }
}
