import { IsArray, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AttachmentType, RecipientType } from '../../interface/email.enum';
import { Field, InputType } from '@nestjs/graphql';

export class EmailTemplate {
  @IsUUID()
  @IsNotEmpty()
  principal: string;

  @IsUUID()
  @IsOptional()
  secondary?: string;

  @IsString()
  @IsOptional()
  metadata?: string;
}

export class EmailArgs {
  @IsNotEmpty()
  @IsString()
  subject: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsNotEmpty()
  @IsString()
  type: string;

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

  @Type(() => EmailTemplate)
  @IsOptional()
  template?: EmailTemplate;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmailRecipient)
  recipients: EmailRecipient[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmailAttachment)
  attachments: EmailAttachment[];
}

export class EmailAditionalInfo {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsOptional()
  phone?: string;
}

@InputType({ isAbstract: true })
export class EmailRecipient {
  @IsEmail()
  @IsNotEmpty()
  @Field(() => String)
  email: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(RecipientType)
  @Field(() => RecipientType)
  type: RecipientType;

  @IsOptional()
  @Type(() => EmailAditionalInfo)
  aditionalInfo?: EmailAditionalInfo;
}

@InputType({ isAbstract: true })
export class EmailAttachment {
  @IsString()
  @IsNotEmpty()
  @IsEnum(AttachmentType)
  @Field(() => AttachmentType)
  type: AttachmentType;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  url?: string;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  base64?: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  extension: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  name: string;
}
