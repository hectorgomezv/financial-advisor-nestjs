import { sub } from 'date-fns';

// TODO: convert to class with static functions
export enum TimeRange {
  Year = 'year',
  TwoYears = 'twoYears',
  ThreeYears = 'threeYears',
  FiveYears = 'fiveYears',
  Month = 'month',
  TwoMonths = 'twoMonths',
  ThreeMonths = 'threeMonths',
  SixMonths = 'sixMonths',
  Week = 'week',
}

export function timeRangeFromStr(rangeStr: string): TimeRange {
  return Object.values(TimeRange).indexOf(rangeStr as TimeRange) >= 0
    ? (rangeStr as TimeRange)
    : TimeRange.Week;
}

export function getRangeStartTimestamp(range: TimeRange): Date {
  switch (range) {
    case TimeRange.Year:
      return sub(new Date(), { years: 1 });
    case TimeRange.TwoYears:
      return sub(new Date(), { years: 2 });
    case TimeRange.ThreeYears:
      return sub(new Date(), { years: 3 });
    case TimeRange.FiveYears:
      return sub(new Date(), { years: 5 });
    case TimeRange.Month:
      return sub(new Date(), { months: 1 });
    case TimeRange.TwoMonths:
      return sub(new Date(), { months: 2 });
    case TimeRange.ThreeMonths:
      return sub(new Date(), { months: 3 });
    case TimeRange.SixMonths:
      return sub(new Date(), { months: 6 });
    case TimeRange.Week:
      return sub(new Date(), { weeks: 1 });
  }
}
