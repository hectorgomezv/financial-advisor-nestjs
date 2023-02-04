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
