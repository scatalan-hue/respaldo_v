import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Transform } from '@nestjs/class-transformer';
import { UserDocumentTypes } from '../../../../common/enum/document-type.enum';

@InputType()
export class SignupEmailInput {
  @Field(() => String)
  @Transform(({ value }) => String(value || "").trim())
  @IsNotEmpty()
  @IsString()
  name: string;

  @Field(() => String)
  @Transform(({ value }) => String(value || "").trim())
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @Field(() => String)
  @Transform(({ value }) => String(value || "").trim())
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @Field(() => String)
  @Transform(({ value }) => String(value || "").trim())
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;

  @Field(() => UserDocumentTypes)
  @IsNotEmpty()
  identificationType: UserDocumentTypes;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  identificationNumber: string;
}
