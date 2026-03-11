import { Field, ID, InputType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class HeartBeatInput {
  @Field(() => String, { nullable: false })
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;
}
