import { ApiProperty } from '@nestjs/swagger';
import { Expose } from '@nestjs/class-transformer';

export class MongoFileInfo {
  @ApiProperty()
  @Expose()
  length: number;

  @ApiProperty()
  @Expose()
  chunkSize: number;

  @ApiProperty()
  @Expose()
  filename: string;

  @ApiProperty()
  @Expose()
  md5: string;

  @ApiProperty()
  @Expose()
  contentType: string;
}
