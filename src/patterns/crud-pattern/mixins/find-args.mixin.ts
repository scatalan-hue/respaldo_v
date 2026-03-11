import { SetMetadata, mixin } from '@nestjs/common';
import { ArgsType, Field, InputType, PartialType } from '@nestjs/graphql';
import { IsBoolean, IsOptional } from 'class-validator';

import { Constructable } from '../types/constructable.type';
import { Pagination } from '../classes/inputs/pagination.input';
import { IFindArgs } from '../interfaces/find-args.interface';

export const WHERE_CLASS_KEY = 'WhereClass';
export const ORDER_BY_CLASS_KEY = 'OrderByClass';

export function FindArgs<WhereStructureType extends Constructable = Constructable, OrderByStructureType extends Constructable = Constructable>(
  whereStructureType?: WhereStructureType,
  orderByStructureType?: OrderByStructureType,
) {
  @ArgsType()
  class ArgsClass implements IFindArgs {
    @Field(() => Pagination, { nullable: true })
    @IsOptional()
    pagination?: Pagination;
  }

  let returnedClass: Constructable<ArgsClass> = ArgsClass;

  if (whereStructureType) {
    @InputType(whereStructureType.name)
    class WhereClass extends PartialType(whereStructureType) {
      @Field(() => [WhereClass], { nullable: true })
      @IsOptional()
      _and?: WhereClass[];

      @Field(() => [WhereClass], { nullable: true })
      @IsOptional()
      _or?: WhereClass[];
    }

    @ArgsType()
    @SetMetadata(WHERE_CLASS_KEY, WhereClass)
    class ArgsClassWithWhere extends returnedClass implements IFindArgs {
      @Field(() => WhereClass, { nullable: true })
      @IsOptional()
      where?: WhereClass;
    }

    returnedClass = ArgsClassWithWhere;
  }

  if (orderByStructureType) {
    @InputType(orderByStructureType.name)
    class OrderByClass extends PartialType(orderByStructureType) {}

    @ArgsType()
    @SetMetadata(ORDER_BY_CLASS_KEY, OrderByClass)
    class ArgsClassWithOrderBy extends returnedClass {
      @Field(() => [OrderByClass], { nullable: true })
      @IsOptional()
      orderBy?: OrderByClass[];
    }

    returnedClass = ArgsClassWithOrderBy;
  }

  return mixin(returnedClass);
}

export function getWhereClass(findArgsType) {
  return Reflect.getMetadata(WHERE_CLASS_KEY, findArgsType);
}

export function getOrderByClass(findArgsType) {
  return Reflect.getMetadata(ORDER_BY_CLASS_KEY, findArgsType);
}
