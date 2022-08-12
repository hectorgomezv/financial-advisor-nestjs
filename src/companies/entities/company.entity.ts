import { Exclude } from 'class-transformer';

export class Company {
  uuid: string;
  name: string;
  symbol: string;

  @Exclude()
  _id: string;

  @Exclude()
  __v: number;
}
