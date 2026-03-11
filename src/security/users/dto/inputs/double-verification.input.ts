import { InputType, Field } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

@InputType()
export class DoubleVerificationInput {
  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  emailVerification?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  phoneVerification?: boolean;

  @Field(() => String, { nullable: true })
  @Transform(({ value }) => String(value || "").trim())
  @IsOptional()
  @IsString()
  code?: string;
}
