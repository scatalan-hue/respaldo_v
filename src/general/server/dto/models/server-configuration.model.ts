import { Field, InputType, Int } from '@nestjs/graphql';
import { IsBoolean, IsNumber, IsString } from 'class-validator';

@InputType()
export class ServerModel {
  @Field(() => String)
  @IsString()
  host: string;

  @Field(() => Int)
  @IsNumber()
  port: number;

  @Field(() => String)
  @IsString()
  url: string;

  @Field(() => Boolean)
  @IsBoolean()
  secure: boolean;
}
