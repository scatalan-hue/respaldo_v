import { Field, ObjectType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { Product } from '../../../../product/entities/products.entity';

@ObjectType()
export class ResponseOrganizationProducts extends Product {
  @IsString()
  @IsOptional()
  @ApiProperty()
  @Field(() => String, { nullable: true })
  key?: string;
}
