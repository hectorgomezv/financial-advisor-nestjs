export class Quote {
  close: number[];
}

export class Indicators {
  quote: Quote[];
}

export class Chart {
  meta: unknown;
  timestamp: number[];
  indicators: Indicators;
}
