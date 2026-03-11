import { Field, InputType } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { UserDocumentTypes } from 'src/common/enum/document-type.enum';

@InputType()
export class UpdateStatusUserAuth0 {
  @Field(() => String)
  @Transform(({ value }) => String(value || "").trim())
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  id: string;

  @Field(() => String)
  @Transform(({ value }) => String(value || "").trim())
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  password: string;

  @Field(() => UserDocumentTypes)
  @Transform(({ value }) => String(value || "").trim())
  @IsEnum(UserDocumentTypes)
  identificationType: UserDocumentTypes;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  identificationNumber: string;
}
