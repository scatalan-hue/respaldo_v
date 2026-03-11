import { Field, InputType, Int, ObjectType, PartialType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsPositive, IsString, Min } from 'class-validator';
import { Constructable } from '../../patterns/crud-pattern/types/constructable.type';
import { mixin } from '@nestjs/common';

@InputType()
export class FilterDto {
  @Field(() => Int, { name: 'limit' })
  @Min(0)
  @ApiProperty()
  limit: number;

  @Field(() => Int, { name: 'page' })
  @Min(0)
  @ApiProperty()
  page: number;

  @Field(() => String, { name: 'route', nullable: true })
  @IsString()
  @ApiProperty({ required: false })
  @IsOptional()
  route?: string;

  @Field(() => String, { name: 'filt', nullable: true })
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  filt?: string;

  @Field(() => String, { name: 'group', nullable: true })
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  group?: string;

  @Field(() => String, { name: 'sort', nullable: true })
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  sort?: string;

  @Field(() => String, { name: 'tag', nullable: true })
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  tag?: string;

  @Field(() => String, { name: 'selectGroup', nullable: true })
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  selectGroup?: string;

  @Field(() => String, { name: 'groupBy', nullable: true })
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  groupBy?: string;

  @Field(() => String, { name: 'cacheQuery', nullable: true })
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  cacheQuery?: string;
}

@ObjectType()
export class MetaPagination {
  @Field(() => Int)
  totalItems: number;

  @Field(() => Int)
  itemCount: number;

  @Field(() => Int)
  itemsPerPage: number;

  @Field(() => Int)
  totalPages: number;

  @Field(() => Int)
  currentPage: number;
}

export function paginationMixin<data extends Constructable = Constructable>(data: data) {
  @InputType()
  class Pagination extends PartialType(data) {
    @Field(() => MetaPagination)
    meta: MetaPagination;

    @Field(() => [data])
    item: data[];
  }
  return mixin(Pagination);
}
