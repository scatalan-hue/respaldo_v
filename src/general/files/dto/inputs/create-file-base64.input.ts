import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateFileBase64Input {
  @IsNotEmpty()
  @ApiProperty()
  @IsString()
  filename: string;

  @IsNotEmpty()
  @ApiProperty()
  @IsString()
  content: string;
}
