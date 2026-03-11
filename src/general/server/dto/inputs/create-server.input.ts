import { Field, InputType, Int } from '@nestjs/graphql';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateServerInput {
  @Field(() => String)
  @IsString()
  code: string;

  @Field(() => String)
  @IsString()
  description: string;

  @Field(() => String)
  @IsString()
  host: string;

  @Field(() => Int)
  @IsNumber()
  port: number;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  url?: string;

  @Field(() => Boolean)
  @IsBoolean()
  secure: boolean;
}
