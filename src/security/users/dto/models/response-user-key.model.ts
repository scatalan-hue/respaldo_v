import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ResponseUserKeyModel {
  @Field(() => String)
  idCode: string;
}
