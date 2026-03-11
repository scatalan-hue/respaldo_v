import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { Transform } from '@nestjs/class-transformer';

@InputType()
export class SendEmailRecoveryPasswordInput {
  @Field(() => String)
  @Transform(({ value }) => String(value || "").trim())
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
