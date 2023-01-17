export class DataPoint {
  timestamp: number;
  value: number;

  constructor(timestamp: number, value: number) {
    this.timestamp = timestamp;
    this.value = value;
  }
}
