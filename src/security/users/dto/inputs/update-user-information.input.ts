import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsOptional, IsString } from 'class-validator';
import { Transform } from '@nestjs/class-transformer';

@InputType()
export class UpdateUserInformationInput {
  @Field(() => String, { nullable: true })
  @Transform(({ value }) => String(value || "").trim())
  @IsOptional()
  @IsString()
  name?: string;

  @Field(() => String, { nullable: true })
  @Transform(({ value }) => String(value || "").trim())
  @IsOptional()
  @IsString()
  lastName?: string;

  @Field(() => String, { nullable: true })
  @Transform(({ value }) => String(value || "").trim())
  @IsOptional()
  @IsEmail()
  email?: string;

  @Field(() => String, { nullable: true })
  @Transform(({ value }) => String(value || "").trim())
  @IsOptional()
  @IsString()
  phoneNumber?: string;
}
