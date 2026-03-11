import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

 export class GetUnreadDocumentsDto {
    @ApiProperty({
      description: 'Type of document transaction',
    })
    @IsNotEmpty()
    @IsString()
    type: string;
  }