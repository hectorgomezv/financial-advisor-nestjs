import Decimal from 'decimal.js';

export class Maths {
  static round(value: Decimal): string {
    if (value.isInteger()) return value.toFixed(0);
    return value.toFixed(2);
  }
}
