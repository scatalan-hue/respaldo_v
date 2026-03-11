import { IsMongoId, IsString } from 'class-validator';

export class CreateFileInput {
  @IsString()
  fileName: string;

  @IsString()
  fileExtension?: string;

  @IsString()
  fileBuffer?: string;

  @IsMongoId()
  fileMongoId?: string;
}
