import { InputType, Field, ID } from '@nestjs/graphql';
import { IsOptional, IsString, IsUUID } from 'class-validator';

@InputType()
export class CreateNotificationGroupInput {
  @Field(() => String)
  @IsString()
  name: string;

  @Field(() => String)
  @IsString()
  @IsOptional()
  metadata?: string;

  @Field(() => ID)
  @IsString()
  @IsUUID()
  notificationConfigId: string;

  @Field(() => ID, { nullable: true })
  @IsString()
  @IsUUID()
  @IsOptional()
  groupId?: string;
}
