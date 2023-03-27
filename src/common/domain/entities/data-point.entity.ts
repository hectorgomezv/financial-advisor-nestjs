export class DataPoint {
  timestamp: Date;
  value: number;

  constructor(timestamp: Date, value: number) {
    this.timestamp = timestamp;
    this.value = value;
  }
}
