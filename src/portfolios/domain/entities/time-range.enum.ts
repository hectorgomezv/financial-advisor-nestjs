export enum TimeRange {
  Year = 'year',
  Month = 'month',
  Week = 'week',
}

export function timeRangeFromStr(rangeStr: string): TimeRange {
  return Object.values(TimeRange).indexOf(rangeStr as TimeRange) >= 0
    ? (rangeStr as TimeRange)
    : TimeRange.Week;
}
