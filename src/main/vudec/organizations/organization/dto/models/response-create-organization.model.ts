import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { OrdenType } from '../../enums/organization-orden.enum';

@ObjectType()
export class ProductsResponseOrganization {
  @IsUUID()
  @IsOptional()
  @ApiProperty()
  @Field(() => ID, { nullable: true })
  id?: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  @Field(() => String, { nullable: true })
  name?: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  @Field(() => String, { nullable: true })
  key?: string;
}

@ObjectType()
export class ResponseOrganization {
  @IsUUID()
  @IsOptional()
  @ApiProperty()
  @Field(() => ID, { nullable: true })
  id?: string;

  @IsString()
  @ApiProperty({ nullable: false })
  @IsOptional()
  @Field(() => String, { nullable: false })
  name: string;

  @IsString()
  @ApiProperty({ nullable: false })
  @IsOptional()
  @Field(() => String, { nullable: false })
  nit: string;

  @IsEnum(OrdenType)
  @ApiProperty({ nullable: false })
  @IsOptional()
  @Field(() => OrdenType, { nullable: false })
  ordenType: OrdenType;

  @IsArray()
  @IsOptional()
  @ApiProperty({ nullable: true })
  @Field(() => [ProductsResponseOrganization], { nullable: true })
  products?: ProductsResponseOrganization[];

  @IsArray()
  @IsOptional()
  @ApiProperty({ nullable: true })
  @Field(() => ProductsResponseOrganization, { nullable: true })
  product?: ProductsResponseOrganization;
}
