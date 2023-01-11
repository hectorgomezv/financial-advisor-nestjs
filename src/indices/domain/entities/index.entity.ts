export class Index {
  uuid: string;
  name: string;
  symbol: string;
  values: IndexValue[];
}

export class IndexValue {
  timestamp: number;
  value: number;
}
