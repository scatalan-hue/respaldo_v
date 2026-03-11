import { IsString, IsUUID } from 'class-validator';
import { CreateFileInput } from './create-file.input';

export class UpdateFileInput extends CreateFileInput {
  @IsString()
  @IsUUID()
  id: string;
}
