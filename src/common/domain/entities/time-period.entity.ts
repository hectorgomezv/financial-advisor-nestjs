import {
  differenceInDays,
  eachMonthOfInterval,
  eachWeekOfInterval,
} from 'date-fns';

export class TimePeriod {
  start: number;
  end: number;

  constructor(start: number, end: number) {
    this.start = start;
    this.end = end;
  }

  static from(startDate: Date, endDate: Date) {
    return new TimePeriod(startDate.getTime(), endDate.getTime());
  }

  static dividePeriod(period: TimePeriod): Date[] {
    const start = new Date(period.start);
    const end = new Date(period.end);

    return differenceInDays(end, start) > 365
      ? eachMonthOfInterval({ start, end })
      : eachWeekOfInterval({ start, end });
  }
}
