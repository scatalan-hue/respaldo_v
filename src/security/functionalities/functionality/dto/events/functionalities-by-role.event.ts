import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';
import { GraphQLJSONObject } from 'graphql-type-json';
import { IContext } from '../../../../../patterns/crud-pattern/interfaces/context.interface';
import { Role } from '../../../../roles/role/entities/role.entity';

@InputType()
export class FunctionalitiesByRoleEventInput {
  @Field(() => GraphQLJSONObject)
  @IsNotEmpty()
  context: IContext;

  @Field(() => Role)
  @IsNotEmpty()
  role: Role;
}
