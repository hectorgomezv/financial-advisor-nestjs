import { Injectable } from '@nestjs/common';

export interface PgIndex {
  id: number;
  name: string;
  symbol: string;
}

export interface PgIndexState {
  id: number;
  name: string;
  symbol: string;
}

@Injectable()
export class IndicesPgRepository {}
