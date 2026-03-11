import { ApiProperty } from '@nestjs/swagger';
import { MongoFileInfo } from './file-info.model';

export class MongoFileResponse {
  @ApiProperty()
  message: string;

  @ApiProperty({ type: MongoFileInfo })
  file: MongoFileInfo;
}
