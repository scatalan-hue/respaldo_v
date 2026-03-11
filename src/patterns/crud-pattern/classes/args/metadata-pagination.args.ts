import { Field, Int, ObjectType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';

@ObjectType()
export class MetadataPagination {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  totalItems?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  itemsPerPage?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  totalPages?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  currentPage?: number;
}
