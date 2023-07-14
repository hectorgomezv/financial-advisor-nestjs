import { faker } from '@faker-js/faker';
import { Chart, Indicators, Quote } from '../domain/entities/chart.entity';

class IndicatorsBuilder {
  private quote: Quote[] = [
    {
      close: [
        faker.date.recent().getTime(),
        faker.date.recent().getTime(),
        faker.date.recent().getTime(),
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
  private meta: string = faker.word.words();
  private timestamp: number[] = [
    faker.date.recent().getTime(),
    faker.date.recent().getTime(),
    faker.date.recent().getTime(),
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
