import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';
import { GraphQLJSONObject } from 'graphql-type-json';
import { FindManyOptions } from 'typeorm';
import { IContext } from '../../../../../patterns/crud-pattern/interfaces/context.interface';

@InputType()
export class FindOneRoleFxByEventInput {
  @Field(() => GraphQLJSONObject)
  @IsNotEmpty()
  context: IContext;

  @IsNotEmpty()
  options: FindManyOptions;
}
