import { IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Field, InputType } from '@nestjs/graphql';

export class WssTemplate {
  @IsUUID()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsOptional()
  metadata?: string;
}

@InputType({ isAbstract: true })
export class WssRecipient {
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  phone: string;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  phonePrefix?: string;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  name?: string;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  document?: string;
}

export class WssArgs {
  @IsUUID()
  @IsOptional()
  notificationGroupId?: string;

  @IsOptional()
  notificationGroupName?: string;

  @IsNotEmpty()
  @IsUUID()
  profileId: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsOptional()
  twoSteps?: boolean;

  @Type(() => WssTemplate)
  template: WssTemplate;

  @IsNotEmpty()
  @Type(() => WssRecipient)
  recipient: WssRecipient;
}
