import { IsString } from 'class-validator';
import { InputType, Field, PartialType, ID } from '@nestjs/graphql';
import { CreateNotificationGroupInput } from './create-notification-group.input';

@InputType()
export class UpdateNotificationGroupInput extends PartialType(CreateNotificationGroupInput) {
  @Field(() => ID)
  @IsString()
  id: string;
}
