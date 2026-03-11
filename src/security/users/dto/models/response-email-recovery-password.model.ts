import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ResponseEmailRecoveryPasswordModel {
  @Field(() => Number)
  expCode: number;
}
