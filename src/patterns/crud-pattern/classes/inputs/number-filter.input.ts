import { Field, Float, InputType } from '@nestjs/graphql';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsDecimal, IsOptional } from 'class-validator';

@InputType()
export class NumberFilter {
  @Field(() => Float, { nullable: true })
  @IsDecimal()
  @IsOptional()
  _eq?: number;

  @Field(() => Float, { nullable: true })
  @IsDecimal()
  @IsOptional()
  _neq?: number;

  @Field(() => Float, { nullable: true })
  @IsDecimal()
  @IsOptional()
  _gt?: number;

  @Field(() => Float, { nullable: true })
  @IsDecimal()
  @IsOptional()
  _gte?: number;

  @Field(() => Float, { nullable: true })
  @IsDecimal()
  @IsOptional()
  _lt?: number;

  @Field(() => Float, { nullable: true })
  @IsDecimal()
  @IsOptional()
  _lte?: number;

  @Field(() => [Float], { nullable: true })
  @IsArray()
  @IsOptional()
  _in?: number[];

  @Field(() => [Float], { nullable: true })
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsOptional()
  _between?: number[];

  @Field(() => [Float], { nullable: true })
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsOptional()
  _notbetween?: number[];
}
