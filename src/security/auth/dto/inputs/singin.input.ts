import { Field, InputType } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { PersonTypes } from '../../../../common/enum/person-type.enum';
import { UserDocumentTypes } from '../../../../common/enum/document-type.enum';

@InputType()
export class SigninInput {
  @Field(() => String, { nullable: true })
  @Transform(({ value }) => String(value || "").trim())
  @IsEmail()
  @IsOptional()
  email?: string;

  @Field(() => String)
  @Transform(({ value }) => String(value || "").trim())
  @MinLength(8)
  @IsNotEmpty()
  @IsString()
  password: string;
}
