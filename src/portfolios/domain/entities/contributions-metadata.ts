import Decimal from 'decimal.js';

export class ContributionsMetadata {
  count: number;
  sum: Decimal;

  constructor(count: number, sum: Decimal) {
    this.count = count;
    this.sum = sum;
  }
}
