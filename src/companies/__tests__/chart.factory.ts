import { faker } from '@faker-js/faker';
import { Chart, Indicators, Quote } from '../domain/entities/chart.entity';

class IndicatorsBuilder {
  private quote: Quote[] = [
    {
      close: [
        faker.datatype.number(),
        faker.datatype.number(),
        faker.datatype.number(),
      ],
    },
  ];

  build(): Indicators {
    return <Indicators>{
      quote: this.quote,
    };
  }
}

export class ChartBuilder {
  private meta: string = faker.random.words();
  private timestamp: number[] = [
    faker.datatype.number(),
    faker.datatype.number(),
    faker.datatype.number(),
  ];
  private indicators: IndicatorsBuilder = new IndicatorsBuilder();

  build(): Chart {
    return <Chart>{
      meta: this.meta,
      timestamp: this.timestamp,
      indicators: this.indicators.build(),
    };
  }
}
