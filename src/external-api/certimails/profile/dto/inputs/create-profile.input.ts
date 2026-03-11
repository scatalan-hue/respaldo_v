import { InputType, Field, Int, ID } from '@nestjs/graphql';
import { IsBoolean, IsEmail, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

@InputType()
export class CreateProfileInput {
  @Field(() => String)
  @IsString()
  description: string;

  @Field(() => String)
  @IsString()
  firstName: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  lastName?: string;

  @Field(() => Int)
  @IsNumber()
  city: number;

  @Field(() => Int)
  @IsNumber()
  region: number;

  @Field(() => String)
  @IsString()
  document: string;

  @Field(() => String)
  @IsEmail()
  email: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  phone?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  externalId?: string;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  default?: Boolean;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  applicationId?: string;
}
