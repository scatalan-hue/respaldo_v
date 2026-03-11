import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { Field, InputType } from '@nestjs/graphql';

@InputType({ isAbstract: true })
export class SmsRecipient {
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  phone: string;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  name?: string;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  lastName?: string;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  email?: string;
}

export class SmsArgs {
  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsOptional()
  metadata?: string;

  @IsUUID()
  @IsOptional()
  notificationGroupId?: string;

  @IsOptional()
  notificationGroupName?: string;

  @IsNotEmpty()
  @IsUUID()
  profileId: string;

  @IsOptional()
  twoSteps?: boolean;

  @IsNotEmpty()
  @Type(() => SmsRecipient)
  recipient: SmsRecipient;
}
