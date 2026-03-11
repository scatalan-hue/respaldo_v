import { InputType, Field, ID } from '@nestjs/graphql';
import { IsArray, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { TypeNotification } from '../../enums/type-notification.enum';
import { EmailRecipient } from '../../../../../external-api/certimails/email/dto/args/email.args';
import { SmsRecipient } from '../../../../../external-api/certimails/sms/dto/args/sms.args';
import { WssRecipient } from '../../../../../external-api/certimails/wss/dto/args/wss.args';
import { NotificationTypes } from '../../../notification-config/enums/notification-type.enum';

@InputType()
export class CreateNotificationInput {
  @Field(() => TypeNotification)
  @IsEnum(TypeNotification)
  type: TypeNotification;

  @Field(() => ID, { nullable: true })
  @IsUUID()
  @IsOptional()
  userId?: string;

  @Field(() => [EmailRecipient], { nullable: true })
  @IsArray()
  @IsOptional()
  emailRecipients?: EmailRecipient[];

  @Field(() => SmsRecipient, { nullable: true })
  @IsOptional()
  smsRecipient?: SmsRecipient;

  @Field(() => WssRecipient, { nullable: true })
  @IsOptional()
  wssRecipient?: WssRecipient;

  @Field(() => NotificationTypes)
  @IsEnum(NotificationTypes)
  typeConfig: NotificationTypes;

  @Field(() => String)
  @IsString()
  subtypeConfig: string;

  @Field(() => String)
  @IsString()
  @IsOptional()
  metadata?: string;

  @Field(() => ID, { nullable: true })
  @IsUUID()
  @IsOptional()
  notificationGroupId?: string;

  @Field(() => ID, { nullable: true })
  @IsString()
  @IsOptional()
  notificationGroupName?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  subject?: string;

  @Field(() => ID, { nullable: true })
  @IsUUID()
  @IsOptional()
  profileId?: string;
}
