import { ApiProperty } from '@nestjs/swagger';

export class Response<T> {
  @ApiProperty()
  success: boolean;
  @ApiProperty()
  status: number;
  @ApiProperty()
  path: string;
  data: T;
}
