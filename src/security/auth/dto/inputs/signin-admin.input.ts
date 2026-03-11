import { Field, InputType } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { VerificationTypes } from '../../enum/verification-type';

@InputType()
export class SigninAdminInput {
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

  @Field(() => VerificationTypes, { nullable: true })
  @IsOptional()
  verificationTypes?: VerificationTypes;
}
