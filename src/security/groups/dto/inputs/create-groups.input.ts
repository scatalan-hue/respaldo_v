import { InputType, Field, ID } from '@nestjs/graphql';
import { IsOptional, IsString, IsUUID } from 'class-validator';

@InputType()
export class CreateGroupInput {
  @Field()
  @IsString()
  name: string;

  @Field(() => ID, { nullable: true })
  @IsUUID()
  @IsOptional()
  notificationConfigId?: string;
}
