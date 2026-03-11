import { IsString } from 'class-validator';
import { InputType, Field, PartialType, ID } from '@nestjs/graphql';
import { CreateNotificationConfigInput } from './create-notification-config.input';

@InputType()
export class UpdateNotificationConfigInput extends PartialType(CreateNotificationConfigInput) {
  @Field(() => ID)
  @IsString()
  id: string;
}
